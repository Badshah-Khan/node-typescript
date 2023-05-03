import pkg from 'graphql-sequelize';

const { JSONType } = pkg

function defaultMetaArgs() {
  return {
    where: {
      type: JSONType.default,
      description:
        'A JSON object conforming the the shape specified in http://docs.sequelizejs.com/en/latest/docs/querying/',
    },
  };
}

export default defaultMetaArgs;
