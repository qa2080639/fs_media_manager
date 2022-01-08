const EntitySchema = require("typeorm").EntitySchema; // import {EntitySchema} from "typeorm";

module.exports = new EntitySchema({
    name: "MediaInfo",
    columns: {
        hash: {
            primary: true,
            type: "varchar",
        },
        hash_type: {
            type: "varchar",
        },
        score: {
            type: "real",
        },
        class: {
            type: "varchar",
        },
        remark: {
            type: "varchar",
        },
        update_time: {
            updateDate: true,
            type: "varchar",
        }
    },
});