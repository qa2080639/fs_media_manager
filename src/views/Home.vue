<template>
  <div class="home">
    <div class="hd">
      <label class="color-666">
        文件名:
        <el-input
          placeholder="请输入文件名"
          prefix-icon="el-icon-search"
          clearable
          v-model="tableConfig.keyWord"
          @change="getMediaData"
          style="width: 150px;"
        ></el-input>
      </label>
      <label class="color-666 ml10">
        备注:
        <el-input
          placeholder="请输入备注"
          prefix-icon="el-icon-search"
          clearable
          v-model="tableConfig.remark"
          @change="getMediaData"
          style="width: 150px;"
        ></el-input>
      </label>
      <span class="color-666 ml10">
        显示路径栏
        <el-switch v-model="isShowPathTree" @change="changeShowPathTree"></el-switch>
      </span>
      <el-dropdown class="pull-right">
        <el-button type="primary">
          索引管理<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="deleteRepeatData">删除重复索引</el-dropdown-item>
          <el-dropdown-item @click.native="deleteIndexs">删除索引</el-dropdown-item>
          <el-dropdown-item @click.native="getRepeatFiles">查找重复文件</el-dropdown-item>
          <el-dropdown-item @click.native="deleteInvalidFiles">删除失效文件</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- <el-button size="mini" class="pull-right" @click="deleteRepeatData">删除重复索引</el-button>
      <el-button type="danger" size="mini" class="pull-right" @click="deleteIndexs">删除索引</el-button> -->
      <!-- <el-button type @click="test" class="ml10">测试</el-button> -->
    </div>
    <div class="bd">
      <div class="left mt10" v-show="isShowPathTree">
        <el-tree :data="pathTree" :props="treeProps" node-key="path" show-checkbox ref="tree"></el-tree>
        <el-button size="mini" type="primary" @click="getCheckedNodes" class="mt10">确定</el-button>
        <el-button size="mini" @click="resetChecked" class="mt10">重置</el-button>
      </div>
      <div class="right">
        <el-table
          :data="tableData"
          border
          highlight-current-row
          ref="table"
          style="width: 100%;margin-top: 10px;"
          @sort-change="onSortChange"
          @filter-change="onFilterChange"
          @row-dblclick="onDblclick"
        >
          <el-table-column type="index" width="50"></el-table-column>
          <el-table-column prop="file_name" label="文件名" column-key="file_name" class-name="pointer"></el-table-column>
          <el-table-column prop="file_path" label="路径" column-key="file_path" class-name="pointer"></el-table-column>
          <el-table-column prop="file_size" label="大小" width="100" sortable="custom">
            <template slot-scope="scope">
              <span>{{scope.row.file_size | formatSize}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="hash_type" label="hash类型" width="100"></el-table-column>
          <el-table-column
            prop="class"
            label="分类"
            width="100"
            :filters="classTag"
            column-key="class"
            filter-placement="bottom-end"
          >
            <template slot-scope="scope">
              <span>{{scope.row.class}}</span>
              <i class="el-icon-edit pointer" @click="openEditDialog(scope.$index,scope.row)"></i>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分数" width="150px" sortable="custom">
            <template slot-scope="scope">
              <el-rate v-model="scope.row.score" @change="changeScore(scope.$index, scope.row)"></el-rate>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="100">
            <template slot-scope="scope">
              <span>{{scope.row.remark}}</span>
              <i class="el-icon-edit pointer" @click="openEditDialog(scope.$index,scope.row)"></i>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-dropdown type="primary" @command="handleCommand">
                <span class="el-dropdown-link">
                  操作
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :command="beforeHandleCommand(scope.$index,scope.row,'open')"
                  >打开文件</el-dropdown-item>
                  <el-dropdown-item
                    :command="beforeHandleCommand(scope.$index,scope.row,'edit')"
                  >编辑信息</el-dropdown-item>
                  <el-dropdown-item
                    :command="beforeHandleCommand(scope.$index,scope.row,'openDir')"
                  >打开文件夹</el-dropdown-item>
                  <el-dropdown-item
                    :command="beforeHandleCommand(scope.$index,scope.row,'delete')"
                  >删除文件</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <div class="text-right mt10">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="tableConfig.pageIndex"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 50, 100]"
            :total="tableConfig.total"
          ></el-pagination>
        </div>
      </div>
    </div>
    <el-dialog title="信息编辑" :visible.sync="dialogFormVisible">
      <el-form :model="editData">
        <el-form-item label="分类" label-width="80px">
          <el-select v-model="editData.class" filterable default-first-option allow-create>
            <el-option
              v-for="item in classTag"
              :label="item.text"
              :value="item.value"
              :key="item.value"
            ></el-option>
          </el-select>
          <!-- <el-input v-model="editData.class"></el-input> -->
        </el-form-item>
        <el-form-item label="评分" label-width="80px">
          <el-rate v-model="editData.score" class="mt8"></el-rate>
        </el-form-item>
        <el-form-item label="备注" label-width="80px">
          <el-input v-model="editData.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer, shell } from "electron";
import store from "store";
export default {
  name: "Home",
  data() {
    return {
      tableData: [
        {
          file_name: "2016-05-02",
          file_path: "C:/Windows",
          file_size: "1.25G",
          hash_type: "王小虎",
          class: "分类",
          score: 5,
          remark: "备注",
        },
      ],
      tableConfig: {
        pageIndex: 1,
        pageSize: 10,
        total: 1,
        keyWord: "",
        remark: "",
        filters: {},
        paths: [],
        sort: {
          field: "",
          order: null,
        },
      },
      dialogFormVisible: false,
      editData: {
        class: "",
        score: 0,
        remark: "",
        index: null
      },
      classTag: [],
      treeProps: {
        label: "name",
        children: "children",
      },
      pathTree: [],
      isShowPathTree: false,
    };
  },
  created() {
    console.log(ipcRenderer.sendSync("main-sync", "ping"));
    this.isShowPathTree = !!store.get("showPathTree");
    this.getMediaData();
    this.getMediaDistinct();
  },
  methods: {
    beforeHandleCommand(index, row, type) {
      return {
        index: index,
        row: row,
        type: type,
      };
    },
    handleCommand(command) {
      console.log(command);
      switch (command.type) {
        case "open":
          shell.openPath(command.row.file_path + "\\" + command.row.file_name);
          break;
        case "openDir":
          shell.openPath(command.row.file_path);
          break;
        case "edit":
          this.editData = this.$noBind(command.row);
          this.editData.index = command.index;
          this.dialogFormVisible = true;
          break;
        case "delete":
          this.$confirm("是否将文件删除到回收站并删除文件信息", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              ipcRenderer.sendSync("deleteFile", command.row);
              this.getMediaData();
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "已取消删除",
              });
            });
          break;
        default:
          break;
      }
    },
    changeScore(index, score) {
      console.log(index, score);
      this.updateInfo(this.tableData[index]);
    },
    onSortChange({ prop, order }) {
      console.log(prop, order);
      this.tableConfig.sort.field = prop;
      this.tableConfig.sort.order = order;
      this.getMediaData();
    },
    onFilterChange(filters) {
      this.tableConfig.filters = filters;
      this.getMediaData();
    },
    onDblclick(row, column) {
      console.log(row, column);
      if (column.columnKey == "file_name") {
        shell.openPath(row.file_path + "\\" + row.file_name);
      }
      if (column.columnKey == "file_path") {
        shell.openPath(row.file_path);
      }
    },
    handleSizeChange(val) {
      this.tableConfig.pageSize = val;
      this.getMediaData();
    },
    handleCurrentChange(val) {
      this.tableConfig.pageIndex = val;
      this.getMediaData();
    },
    getMediaData() {
      // todo pageIndex返回1情况
      var result = ipcRenderer.sendSync("getMediaData", this.tableConfig);
      console.log(result);
      this.tableData = result.data;
      this.tableConfig.total = result.total;
    },
    getMediaDistinct() {
      var result = ipcRenderer.sendSync("getMediaDistinct");
      console.log(result);
      this.classTag = result.classTag.map((item) => {
        return {
          text: item,
          value: item,
        };
      });
      this.pathsToTree(result.paths);
    },
    pathsToTree(paths) {
      let tree = [];
      let pathArrs = paths.map((item) => item.split("\\"));
      this.$noBind(pathArrs).forEach((pathArr) => {
        let tempObj = {};
        pathArr.forEach((path, index) => {
          let pathParent = pathArr.slice(0, index + 1).join("\\");
          // console.log(pathParent);
          if (index == 0) {
            let index = tree.findIndex((item) => item.path == path);
            if (index !== -1) {
              tempObj = tree[index];
            } else {
              tree.push({
                name: path,
                path: pathParent,
                children: [],
              });
              tempObj = tree[tree.length - 1];
            }
          } else {
            let index = tempObj.children.findIndex(
              (item) => item.path == pathParent
            );
            if (index !== -1) {
              tempObj = tempObj.children[index];
            } else {
              tempObj.children.push({
                name: path,
                path: pathParent,
                children: [],
              });
              tempObj = tempObj.children[tempObj.children.length - 1];
            }
          }
        });
      });
      console.log(tree);
      this.pathTree = tree;
    },
    openEditDialog(index, row) {
      this.editData = this.$noBind(row);
      this.editData.index = index;
      this.dialogFormVisible = true;
    },
    saveEdit() {
      let result = this.updateInfo(this.editData);
      if (result == "ok") {
        this.$set(this.tableData, this.editData.index, this.editData);
        this.dialogFormVisible = false;
      }
    },
    updateInfo(data) {
      console.log(data);
      let result = ipcRenderer.sendSync("updateMediaInfo", data);
      return result;
    },
    getCheckedNodes() {
      let nodes = this.$refs.tree.getCheckedNodes();
      let paths = nodes.map((item) => item.path);
      // path去子文件夹
      let newPaths = [];
      paths.forEach((path) => {
        let pathArr = path.split("\\");
        let isRepeat = false;
        for (let index = 0; index < pathArr.length - 1; index++) {
          let pathParent = pathArr.slice(0, index + 1).join("\\");
          isRepeat = paths.some((item) => item == pathParent);
          if (isRepeat) {
            break;
          }
        }
        if (!isRepeat) {
          newPaths.push(path);
        }
      });
      console.log(newPaths);
      this.tableConfig.paths = newPaths;
      this.getMediaData();
    },
    resetChecked() {
      this.$refs.tree.setCheckedKeys([]);
      this.tableConfig.paths = [];
      this.getMediaData();
    },
    changeShowPathTree(value) {
      store.set("showPathTree", value);
    },
    deleteIndexs() {
      this.$confirm("是否清除所有索引数据", "提示:数据无价,操作谨慎", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.getCheckedNodes();
          ipcRenderer.sendSync("deleteIndexs", this.tableConfig);
          setTimeout(() => {
            this.getMediaData();
            this.getMediaDistinct();
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          }, 500);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    deleteRepeatData() {
      ipcRenderer.sendSync("deleteRepeatData", this.tableConfig);
      setTimeout(() => {
        this.getMediaData();
        this.getMediaDistinct();
        this.$message({
          type: "success",
          message: "删除成功!",
        });
      }, 500);
    },
    getRepeatFiles() {
      var result = ipcRenderer.sendSync("getRepeatFiles", this.tableConfig);
      this.tableData = result;
    },
    deleteInvalidFiles() {
      ipcRenderer.send("deleteInvalidFiles", this.tableConfig);
      ipcRenderer.once("deleteInvalidFiles-reply", (event, arg) => {
        console.log(arg);
        this.$message({
          message: "失效文件清理完毕",
          type: "success",
        });
        this.getMediaData();
        this.getMediaDistinct();
      });
    },
  },
};
</script>

<style scoped>
.hd {
  overflow: hidden;
}

.bd {
  display: flex;
}

.bd .left {
  padding-right: 10px;
  min-width: 140px;
}

.bd .right {
  flex: 1;
  overflow: auto;
}
</style>