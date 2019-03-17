module.exports = api =>{
    api.cache(true);
    const presets= [
        "@babel/preset-env",
        "@babel/preset-typescript"
    ];
    const plugins = [
    ];
  return{
      env:{
          cjs:{
              presets,
              plugins:[...plugins, ["@babel/plugin-transform-modules-commonjs", {allowTopLevelThis: true}]]
          },
          es:{
              presets,
              plugins
          }
      }
  };
};