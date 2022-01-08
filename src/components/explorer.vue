<template>
  <div>
    <el-tree :props="props" :load="loadNode" lazy show-checkbox @check-change="handleCheckChange" ref="tree"></el-tree>
  </div>
</template>

<script>
const fs = require("fs");
const path = require("path");
const { diskinfo } = require("@dropb/diskinfo");
export default {
  name: "explorer",
  data() {
    return {
      props: {
        label: "name",
        children: "zones",
      },
    };
  },
  methods: {
    handleCheckChange(data, checked, indeterminate) {
      console.log(data, checked, indeterminate);
    },
    handleNodeClick(data) {
      console.log(data);
    },
    loadNode(node, resolve) {
      // console.log(node);
      if (node.level === 0) {
        diskinfo()
          .then((result) => {
            let disks = result.map((item) => {
              return { name: item.target, path: item.target + '\\' };
            });
            resolve(disks);
            // console.log(result);
          })
          .catch((err) => console.error(err.message));
      } else {
        let childData = this.getChildPath(node.data.path);
        resolve(childData);
      }
    },
    getChildPath(currentDirPath) {
      // console.log(currentDirPath);
      let paths = [];
      fs.readdirSync(currentDirPath).forEach((name) => {
        // console.log(name);
        var filePath = path.join(currentDirPath, name);
        try {
          var stat = fs.statSync(filePath, { throwIfNoEntry: false });
        } catch (error) {
          console.log(error);
          return;
        }
        if (stat.isDirectory()) {
          paths.push({
            name: name,
            path: filePath,
          });
        }
      });
      return paths;
    },
    getPaths() {
      let nodes = this.$refs.tree.getCheckedNodes();
      let paths = nodes.map(item => item.path);
      console.log(paths);
      return paths;
    }
  },
};
</script>

<style scoped>
</style>