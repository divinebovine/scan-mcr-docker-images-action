const sortTags = (a, b) => {
    let [aVer, aDist] = a.split("-");
    let [bVer, bDist] = b.split("-");

    let [aMaj, aMin, aPatch] = aVer
        .split(".")
        .map((x) => (x !== null ? parseInt(x) : null));
    let [bMaj, bMin, bPatch] = bVer
        .split(".")
        .map((x) => (x !== null ? parseInt(x) : null));

    if (aMaj < bMaj) {
        return -1;
    }

    if (aMaj > bMaj) {
        return 1;
    }

    if (aMin < bMin) {
        return -1;
    }

    if (aMin > bMin) {
        return 1;
    }

    if (aPatch < bPatch) {
        return -1;
    }

    if (aPatch > bPatch) {
        return 1;
    }

    if (aDist.toUpperCase() < bDist.toUpperCase()) {
        return -1;
    }

    if (aDist.toUpperCase() > bDist.toUpperCase()) {
        return 1;
    }

    // must be equal
    return 0;
};

export default function limitVersions(tags, versionLimit) {
  if (versionLimit === '*') {
    return tags;
  }
  
  const limitVersionsFilter = (element) => {
    let tagMaj = parseInt(element.split(".")[0]);
    if (tagMaj < (latestMaj - (versionLimit - 1))) {
        return false;
    }
    return true;
  };

  let sortedTags = tags.sort(sortTags).reverse();
  let latestMaj = parseInt(sortedTags[0].split(".")[0]);
  return tags.filter(limitVersionsFilter);
}