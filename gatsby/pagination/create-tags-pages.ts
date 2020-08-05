import { Actions, CreatePagesArgs } from "gatsby";
import { AllMarkdownRemark, Tag } from "../../src";

const kebabCase = require("lodash.kebabcase");
const path = require("path");
const siteConfig = require("../../config.js");

module.exports = async (graphql: CreatePagesArgs["graphql"], actions: Actions) => {
  const { createPage } = actions;
  const { postsPerPage } = siteConfig;

  const result = await graphql<AllMarkdownRemark>(`
    {
      allMarkdownRemark(
        filter: {
          frontmatter: { template: { eq: "post" }, draft: { ne: true } }
        }
      ) {
        group(field: frontmatter___tags) {
          fieldValue
          totalCount
        }
      }
    }
  `);

  const tags = result.data!.allMarkdownRemark.group;

  Object.values(tags).forEach((tag: Tag) => {
    const numPages = Math.ceil(tag.totalCount / postsPerPage);
    const tagSlug = `/tag/${kebabCase(tag.fieldValue)}`;

    for (let i = 0; i < numPages; i += 1) {
      createPage({
        path: i === 0 ? tagSlug : `${tagSlug}/page/${i}`,
        component: path.resolve("./src/templates/tag-template.tsx"),
        context: {
          tag: tag.fieldValue,
          currentPage: i,
          postsLimit: postsPerPage,
          postsOffset: i * postsPerPage,
          prevPagePath: i <= 1 ? tagSlug : `${tagSlug}/page/${i - 1}`,
          nextPagePath: `${tagSlug}/page/${i + 1}`,
          hasPrevPage: i !== 0,
          hasNextPage: i !== numPages - 1,
        },
      });
    }
  });
};

export {}