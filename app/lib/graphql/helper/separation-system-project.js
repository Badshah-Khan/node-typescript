import config from 'config';
import { Op } from 'sequelize';
import { models } from '../../db';

const { Organization, Project } = models;

// Build  where without system project
export default async function whereWithoutSystemProjects(where, user, fieldName = 'project', filterSystemProjects) {
  const organization = await Organization.findById(user.organization);
  if (!organization) return where;
  const project = await Project.findOne({
    where: {
      organization: organization.id,
      name: `${organization.workspace}-${config.get('app.project.systemTimeEntryRulesProject')}`,
    },
  });
  if (project) {
    const whereProject = where[fieldName]
      ? {
          [Op.and]: [where[fieldName], { [Op.ne]: project.id }],
        }
      : {
          [Op.or]: [{ [Op.ne]: project.id }, { [Op.is]: null }],
        };
    return { ...where, [fieldName]: whereProject };
  }
  if (filterSystemProjects && !project) {
    const whereProject = {
      [Op.or]: [
        { [Op.and]: [{ project: { [Op.is]: null } }, { isPrivate: true }] },
        { [Op.and]: [{ project: { [Op.ne]: null } }, { isPrivate: false }] },
      ],
    };
    return { ...where, ...whereProject };
  }
  return where;
}
