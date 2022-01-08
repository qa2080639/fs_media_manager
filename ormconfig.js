const Media = require("./src/entity/MediaSchema");
const MediaInfo = require("./src/entity/MediaInfoSchema");

export default {
   "type": "sqlite",
   "database": "data.db",
   "synchronize": false,
   "logging": true,
   "entities": [
      Media,
      MediaInfo
   ]
}