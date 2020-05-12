const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

const categoryBuilder = build('Category', {
  fields: {
    id: sequence(),
    seq: sequence(),
    category: fake(f => f.lorem.sentence()),
  }
})

const jobBuilder = build('Job', {
  fields: {
    id: sequence(),
    title: fake(f => f.lorem.sentence()),
  }
});

const trainingBuilder = build('Training', {
  fields: {
    id: sequence(),
    uid: fake(f => f.random.uuid()),
    title: fake(f => f.lorem.sentence()),
    expires: fake(f => f.date.future(1).toISOString()),
    categoryFk: perBuild(() => {
      return categoryBuilder().id;
    }),
  }
});

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake(f => f.random.uuid()),
    NameOrIdValue: fake(f => f.name.findName()),
    mainJob: perBuild(() => {
      return jobBuilder();
    }),
    workerTraining: [
      perBuild(() => {
        return trainingBuilder();
      }),
    ],
  },
});

module.exports.workerBuilder = workerBuilder;
module.exports.jobBuilder = jobBuilder;
module.exports.categoryBuilder = categoryBuilder;
module.exports.trainingBuilder = trainingBuilder;
