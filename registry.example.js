const HTML = ({ registry = {} } = {}) => {
  return (strings, ...substitutions) => {};
};

const createRegistry = (tags = []) => ({
  toString() {
    return tags
      .map(
        ([name, tag]) =>
          `<script>customElements.define('${name}',${tag})</script>`
      )
      .join("");
  },
  instantiate() {
    tags.forEach(([name, tag]) => {
      customElements.define(name, tag);
    });
  },
});

const registry = createRegistry([["ui-card", class extends HTMLElement {}]]);

HTML({ registry })`<html>
  <head>
    ${registry.toString()}
  </head>
  <body>
    <ui-card></ui-card>
  </body>
</html>`;
