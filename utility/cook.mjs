// https://2ality.com/2016/11/computing-tag-functions.html
export const cook = (strs, ...substs) => {
  return substs.reduce((prev, cur, i) => prev + cur + strs[i + 1], strs[0]);
};
export default cook;
