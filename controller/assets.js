const User = require("../models/user");
const Assets = require("../models/Assets");
const { Router } = require("express");
const router = Router();
const auth = require("../auth");

const fetch = (url) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url));

const SALE_COUNT_URL =
  "https://api.opensea.io/api/v1/assets?order_by=sale_count&order_direction=desc&offset=0&limit=20";

const getAssets = async () => {
  await Assets.deleteMany({});
  let [response, data] = [null, null];
  response = await fetch(SALE_COUNT_URL);
  data = await response.json();
  data.assets.forEach((asset) => {
    Assets.create({
      name: asset.name,
      sales: asset.num_sales,
      img: asset.collection.image_url,
      site: asset.external_link,
      slug: asset.collection.slug,
      description: asset.description,
      date_created: asset.date_created,
    });
  });
};

//Index Route
router.get("/", async (req, res) => {
  getAssets();
  try {
    res.status(200).json(await Assets.find({}));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//Create Route
router.post("/", async (req, res) => {
  const [address, token] = [req.body.address, req.body.token];
  try {
    const response = await fetch(
      `https://api.opensea.io/api/v1/asset/${address}/${token}/`
    );
    const asset = await response.json();
    await Assets.create({
      name: asset.name,
      sales: asset.num_sales,
      img: asset.image_url,
      site: asset.external_link,
      slug: asset.slug,
      description: asset.description,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});
//Update Route
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    res
      .status(200)
      .json(await Assets.findByIdAndUpdate(id, req.body, { new: true }));
  } catch (error) {
    res.status(400).json({ error });
  }
});
//Destroy Route
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    res.status(200).json(await Assets.findByIdAndDelete(id));
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
