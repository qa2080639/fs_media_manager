const EntitySchema = require("typeorm").EntitySchema; // import {EntitySchema} from "typeorm";

module.exports = new EntitySchema({
    name: "Media",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        file_name: {
            type: "varchar"
        },
        file_path: {
            type: "varchar",
        },
        file_size: {
            type: "int",
        },
        hash: {
            type: "varchar",
        },
        hash_type: {
            type: "varchar",
        },
        create_time: {
            createDate: true,
            type: "varchar",
        },
    }
});