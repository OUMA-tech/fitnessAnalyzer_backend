module.exports = {
    apps: [
      {
        name: "web",
        script: "./dist/index.js",
      },
      {
        name: "bullmq-workers",
        script: "./dist/workers/index.js",
      }
    ]
  };
  