<template>
  <div>
    <div class="btns el-row--flex">
      <div class="el-col-12">
        <el-button type="primary" @click="createIndexs">建立索引</el-button>
        <label class="color-666 ml10">
          索引设置
          <el-switch v-model="isShowConfig"></el-switch>
        </label>
      </div>
      <div class="el-col-12 text-right">
        <el-button type="danger" @click="deleteIndexs">清空索引</el-button>
      </div>
    </div>
    <div class="config" v-show="isShowConfig">
      <div class="mt5 mb20">
        <p class="color-666 mb5">索引拓展名</p>
        <el-tag
          :key="tag"
          v-for="tag in config.exts"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)"
        >{{tag}}</el-tag>
        <el-input
          class="input-new-tag"
          v-if="inputVisible"
          v-model="inputValue"
          ref="saveTagInput"
          size="small"
          @keyup.enter.native="handleInputConfirm"
          @blur="handleInputConfirm"
        ></el-input>
        <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增</el-button>
      </div>
      <div class="mb20 color-666">
        索引文件大于
        <el-input type="number" v-model.number="config.minSize" placeholder style="width: 70px;"></el-input>(m)
      </div>
      <div class="mb10">
        <p class="color-666 mb5">索引组合</p>
        <el-checkbox label="修改时间" v-model="config.hashType.mtime"></el-checkbox>
        <el-checkbox label="文件大小" v-model="config.hashType.size"></el-checkbox>
        <el-checkbox label="文件名" v-model="config.hashType.name"></el-checkbox>
      </div>
      <hr />
    </div>
    <explorer ref="explorer" class="mt10"></explorer>
  </div>
</template>

<script>
const defaultConfig = {
  exts: [
    ".mkv",
    ".avi",
    ".mp4",
    ".rmvb",
    ".rm",
    ".mpeg",
    ".asf",
    ".mpg",
    ".wmv",
    ".vob",
    ".mov",
    ".ts",
    ".m2t",
    ".mts",
  ],
  minSize: 5,
  hashType: {
    mtime: true,
    size: true,
    name: false
  }
};
import { ipcRenderer } from "electron";
import store from "store";
import explorer from "../components/explorer";
export default {
  name: "indexs",
  components: {
    explorer,
  },
  data() {
    return {
      config: {
        exts: [],
        minSize: 5,
        hashType: {},
      },
      isShowConfig: false,
      inputVisible: false,
      inputValue: "",
    };
  },
  created() {
    let config = store.get("indexesConfig");
    this.config = config ? config : defaultConfig;
  },
  methods: {
    createIndexs() {
      let paths = this.$refs.explorer.getPaths();
      if (!paths.length) {
        return this.$message({
          type: "info",
          message: "请选择索引路径",
        });
      }
      let data = {
        paths: this.$refs.explorer.getPaths(),
        config: this.config,
      };
      ipcRenderer.send("indexs", data);
      ipcRenderer.once("indexs-reply", (event, arg) => {
        console.log(arg);
        this.$message({
          message: "索引建立完毕",
          type: "success",
        });
      });
      this.explorerDialog = false;
      this.saveConfig();
    },
    saveConfig() {
      store.set("indexesConfig", this.config);
    },
    handleClose(tag) {
      this.config.exts.splice(this.config.exts.indexOf(tag), 1);
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.config.exts.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    deleteIndexs() {
      this.$confirm("是否清除所有索引数据", "提示:数据无价,操作谨慎", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          ipcRenderer.sendSync("deleteIndexs", null);
          this.$message({
            type: "success",
            message: "清除成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
  },
};
</script>

<style scoped>
.el-tag {
  margin-bottom: 5px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>