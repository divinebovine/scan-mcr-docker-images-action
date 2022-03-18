import fetch from 'node-fetch';
import core from '@actions/core';
import limitTags from "./modules/limitTags.js";

let repoUrl, images, regex, versionLimit;
let imageArray = [];
let outputTags = [];
try {
  repoUrl = core.getInput("repo-url");
  images = core.getInput("image");
  regex = new RegExp(core.getInput("tag-regex"));
  versionLimit = core.getInput("version-limit");
} catch (err) {
  const msg = "Failed to initialize action: " + err.message;
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
imageArray.forEach(element => {
  fetch(`${repoUrl}/v2/${images}/tags/list`)
      .then((response) => processResponse(response))
      .then((json) => {
          let { tags } = json;
          let filteredTags = tags.filter((tag) => regex.test(tag));
          let limitedTags = limitTags(filteredTags, versionLimit);
          outputTags.concat(limitedTags);
      })
      .catch((err) => {
          const msg = "Failed to scan Docker repository: " + err.message;
          core.setFailed(msg);
          console.error(msg);
          console.error(err);
          process.exit(1);
      });
});

core.setOutput("tags", outputTags);
