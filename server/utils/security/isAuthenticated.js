const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const AUTH_HEADER = 'authorization';
const thisIss = config.get('jwt.iss');
const models = require('../../models');

exports.getTokenSecret = () => {
  return process.env.Token_Secret ? process.env.Token_Secret : "nodeauthsecret";
}

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
  const token = getToken(req.headers[AUTH_HEADER]);

  if (token) {
    // var dec = getverify(token, Token_Secret);

    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        req.username= claim.sub;
        req.role = claim.role;
        req.isParent = claim.isParent;
        req.establishment = {
          id: claim.EstblishmentId,
          uid: claim.hasOwnProperty('EstablishmentUID') ? claim.EstablishmentUID : null
        };
        next();
      }
    });    
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

// this util middleware will block if the given request is not authorised but will also extract
//  the EstablishmentID token, and make it available on the request
exports.hasAuthorisedEstablishment = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  
  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send({
          sucess: false,
          message: 'token is invalid'
        });
      } else {               
  
        // must provide the establishment ID and it must be a number
        if (!claim.EstblishmentId || isNaN(parseInt(claim.EstblishmentId))) {
          console.error('hasAuthorisedEstablishment - missing establishment id parameter');
          return res.status(400).send(`Unknown Establishment ID`);
        }
        const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
        if (!claim.EstablishmentUID || !uuidV4Regex.test(claim.EstablishmentUID)) {
          console.error('hasAuthorisedEstablishment - missing establishment uid parameter');
          return res.status(400).send(`Unknown Establishment UID`);
        }

        // the given parameter could be a UUID or integer - first authorised against known primary establishment
        let establishmentIdIsUID = false;
        let isAuthorised = false;
        if (uuidV4Regex.test(req.params.id)) {
          // establishment id in params is a UUID - tests against UID in claim
          establishmentIdIsUID = true;
          if (claim.EstablishmentUID === req.params.id) {
            req.establishmentId=claim.EstablishmentUID;
            isAuthorised = true;
          }
        } else {
          if (claim.EstblishmentId === parseInt(req.params.id)) {
            req.establishmentId = claim.EstblishmentId;
            isAuthorised = true;
          }
        }

        // if still not authorised - and only if this user is attributed to a parent establishment
        //  then follow up by checking against any of the known subsidaries of this parent establishment
        //  including that of the given establishment (only known by it's UID)
        if (isAuthorised === false && claim.isParent) {
          models.establishment.findOne({
            attributes: ['id', 'dataOwnerPermissions'],
            where: {
              parentId: claim.EstblishmentId,
              uid: req.params.id,
            }
          })
          .then(record => record.get())
          .then(establishment => {
            // this is a known subsidairy of this given parent establishment
            
            // but, so be able to access the subsidary, then the permissions must not be null
            if (establishment.dataOwnerPermissions === null) {
              console.error(`Found subsidiary establishment (${req.params.id}) for this known parent (${claim.EstblishmentId}/${claim.EstablishmentUID}), but access has not been given`);
              // failed to find establishment by UUID - being a subsidairy of this known parent
              return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
            }

            req.establishmentId = establishment.id;
            req.dataOwnerPermissions = establishment.dataOwnerPermissions;    // this will be required for Worker level access tests .../server/routes/establishments/worker.js::validateWorker

            // we now know the 
            establishmentIdIsUID = false;

            // restore claims
            req.username= claim.sub;
            req.isParent = claim.isParent;
            req.role = claim.role;
            req.establishment = {
              id: claim.EstblishmentId,
              uid: establishmentIdIsUID ? claim.EstablishmentUID : null
            };

            next();
          })
          .catch(err => {
            // failed to find establishment by UUID - being a subsidairy of this known parent
            console.error(`Failed to find subsidiary establishment (${req.params.id}) for this known parent (${claim.EstblishmentId}/${claim.EstablishmentUID})`);
            return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
          });
        } else if (isAuthorised === false) {
          console.error(`hasAuthorisedEstablishment - given and known establishment id do not match: given (${req.params.id})/known (${claim.EstblishmentId}/${claim.EstablishmentUID})`);
          return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
        } else {
          // gets here and all is authorised
          req.username= claim.sub;
          req.isParent = claim.isParent;
          req.role = claim.role;
          req.establishment = {
            id: claim.EstblishmentId,
            uid: establishmentIdIsUID ? claim.EstablishmentUID : null
          };

          // having settled all claims, it is necessary to normalise req.establishmentId so it is always the establishment primary key
          if (establishmentIdIsUID) {
            models.establishment.findOne({
              attributes: ['id'],
              where: {
                uid: req.establishment.uid
              }
            })
            .then(record => record.get())
            .then(establishment => {
              req.establishmentId = establishment.id;
              next();
            })
            .catch(err => {
              // failed to find establishment by UUID - not authorised
              console.error(`FATAL - Authorised against primary establishment (${claim.EstblishmentId}/${claim.EstablishmentUID}), but failed to normalise the establishment UUID`);
              return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
            });
          } else {
            // it's already primary key
            next();
          }
        }
      }     
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
}

getToken = function (headers) {
  if (headers) {

    let token = headers;

    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length);
    }
    return token;
  }
  return null;
};

exports.isAuthorisedPasswdReset = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {

      // can be either a password reset token or a logged in token

      if (err || claim.aud !== config.get('jwt.aud.passwordReset') || claim.iss !== thisIss) {
        console.error('Password reset token is invalid');
        return res.status(403).send('Invalid token');

      } else {
        // extract token claims and add to the request for subsequent use
        req.resetUuid = claim.resetUUID;
        req.username = claim.sub;
        req.fullname = claim.name;
        next();
      }      
    });    
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
}

exports.isAuthorisedAddUser = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {

      // can be either a password reset token or a logged in token

      if (err || claim.aud !== config.get('jwt.aud.addUser') || claim.iss !== thisIss) {
        console.error('Add User token is invalid');
        return res.status(403).send('Invalid token');

      } else {
        // extract token claims and add to the request for subsequent use
        req.addUserUUID = claim.addUserUUID;
        req.userUID = claim.sub;
        req.fullname = claim.name;
        next();
      }      
    });    
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
}