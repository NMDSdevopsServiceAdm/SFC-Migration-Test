const EstablishmentTransformer = async (establishments) => {
  return establishments.map(establishment => {
    const parent = establishment.Parent
      ? { uid: establishment.Parent.uid, nmdsId: establishment.Parent.nmdsId }
      : {};

    const users = establishment.users
      ? establishment.users.map((user) => {
          return {
            uid: user.uid,
            name: user.FullNameValue,
            username: user.login ? user.login.username : '',
            securityQuestion: user.SecurityQuestionValue,
            securityAnswer: user.SecurityQuestionAnswerValue,
            isLocked: user.login && user.login.status === 'Locked',
          };
        })
      : [];

    return {
      uid: establishment.uid,
      name: establishment.NameValue,
      nmdsId: establishment.nmdsId,
      postcode: establishment.postcode,
      isRegulated: establishment.isRegulated,
      address1: establishment.address1,
      address2: establishment.address2,
      town: establishment.town,
      county: establishment.county,
      isParent: establishment.isParent,
      dataOwner: establishment.dataOwner,
      locationId: establishment.locationId,
      lastUpdated: establishment.updated,
      employerType: {
        value: establishment.EmployerTypeValue,
        other: establishment.EmployerTypeOther
      },
      parent,
      users,
    };
  });
}

module.exports.EstablishmentTransformer = EstablishmentTransformer;