import { readJson, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { libraryGenerator } from '@nrwl/workspace/generators';
import { cypressProjectGenerator } from './cypress-project';
import { Linter } from '@nrwl/linter';

describe('@nrwl/storybook:cypress-project', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await libraryGenerator(tree, {
      name: 'test-ui-lib',
    });
  });

  it('should generate files', async () => {
    await cypressProjectGenerator(tree, {
      name: 'test-ui-lib',
      linter: Linter.EsLint,
    });

    expect(tree.exists('apps/test-ui-lib-e2e/cypress.json')).toBeTruthy();
    const cypressJson = readJson(tree, 'apps/test-ui-lib-e2e/cypress.json');
    expect(cypressJson.baseUrl).toBe('http://localhost:4400');
  });

  it('should update `angular.json` file', async () => {
    await cypressProjectGenerator(tree, {
      name: 'test-ui-lib',
      linter: Linter.EsLint,
    });
    const project = readProjectConfiguration(tree, 'test-ui-lib-e2e');

    expect(project.targets.e2e.options.devServerTarget).toEqual(
      'test-ui-lib:storybook'
    );
    expect(project.targets.e2e.options.headless).toBeUndefined();
    expect(project.targets.e2e.options.watch).toBeUndefined();
    expect(project.targets.e2e.configurations).toEqual({
      ci: { devServerTarget: `test-ui-lib:storybook:ci` },
    });
  });

  it('should generate in the correct folder', async () => {
    await cypressProjectGenerator(tree, {
      name: 'test-ui-lib',
      directory: 'one/two',
      cypressName: 'other-e2e',
      linter: Linter.EsLint,
    });
    const workspace = readJson(tree, 'workspace.json');
    expect(workspace.projects['one-two-other-e2e']).toBeDefined();
    expect(tree.exists('apps/one/two/other-e2e/cypress.json')).toBeTruthy();
  });
});
