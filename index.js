import fetch from 'node-fetch';
import core from '@actions/core';
import limitTags from './modules/limitTags.js';

let repoUrl, images, regex, versionLimit;
let imageArray = [];
let outputImages = [];
let promises = [];
try {
  repoUrl = core.getInput('repo-url');
  images = core.getInput('images');
  regex = new RegExp(core.getInput('tag-regex'));
  versionLimit = core.getInput('version-limit');
} catch (err) {
  const msg = 'Failed to initialize action: ' + err.message;
  core.setFailed(msg);
  console.error(msg);
  console.error(err);
  process.exit(1);
}

const processResponse = (res) => {
  if (res.status < 400) {
    return res.json();
  } else {
    throw new Error(
      `Response from server: '${res.statusText}' (${res.status}) for URL ${res.url}`
    );
  }
};

try {
  imageArray = JSON.parse(images);
} catch (err) {
  imageArray.push(images);
}


imageArray.forEach((image) => {
  promises.push(
    fetch(`${repoUrl}/v2/${image}/tags/list`)
      .then((response) => processResponse(response))
      .then((json) => {
        let { tags } = json;
        let filteredTags = tags.filter(tag => regex.test(tag));
        let limitedTags = limitTags(filteredTags, versionLimit);
        let fullNames = limitedTags.map((tag) => `${image}:${tag}`);
        outputImages.push(...fullNames);
      })
      .catch((err) => {
        const msg = 'Failed to scan Docker repository: ' + err.message;
        core.setFailed(msg);
        console.error(msg);
        console.error(err);
        process.exit(1);
      })
  )
});

Promise.all(promises).then(() => {
  console.log(`Images discovered:\n${outputImages.join('\n')}`);
  core.setOutput('images', outputImages);
});


