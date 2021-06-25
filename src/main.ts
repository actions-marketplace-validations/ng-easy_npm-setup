import { setFailed, error, info } from '@actions/core';

import { Cache, getCypressCache, getNodeModulesCache, getNpmCache, getNxCache, restoreCacheAction, saveCacheAction } from './lib/cache';
import { installCypress, isCypressRequired } from './lib/cypress';
import { installDependencies } from './lib/npm';

export async function npmSetupAction() {
  const nodeModulesCache: Cache = await getNodeModulesCache();
  const npmModulesCache: Cache = await getNpmCache();
  const cypressCache: Cache = await getCypressCache();
  const nxCache: Cache = await getNxCache();

  if (await restoreCacheAction(nodeModulesCache)) {
    if ((await isCypressRequired()) && !(await restoreCacheAction(cypressCache))) {
      await installCypress();
    }
  } else {
    await restoreCacheAction(npmModulesCache);
    await installDependencies();
    await saveCacheAction(nodeModulesCache);
    await saveCacheAction(npmModulesCache);
    if (await isCypressRequired()) {
      await saveCacheAction(cypressCache);
    }
  }

  //if (ixNxCached()) {
  await restoreCacheAction(nxCache);
  //}
}

if (!module.parent) {
  npmSetupAction()
    .then(() => {
      info('');
      info('npm dependencies restored successfully');
    })
    .catch((err) => {
      error(err);
      setFailed(err.message);
    });
}