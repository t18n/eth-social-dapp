const SocialDapp = artifacts.require("SocialDapp");

module.exports = async function (deployer) {
  await deployer.deploy(SocialDapp);
};
