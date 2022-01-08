<template>
  <div id="app">
    <el-container :style="{height:height+'px'}">
      <el-container>
        <el-header class="no-padding">
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo pl20"
            mode="horizontal"
            @select="handleSelect"
          >
            <el-menu-item index="1">
              <router-link to="/">文件管理</router-link>
            </el-menu-item>
            <el-menu-item index="2">
              <router-link to="/Indexes">索引管理</router-link>
            </el-menu-item>
            <!-- <el-menu-item index="3">
              <router-link to="/setting">系统设置</router-link>
            </el-menu-item> -->
          </el-menu>
          <!-- <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 20px;font-size: 20px;"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>文件管理</el-dropdown-item>
              <el-dropdown-item>建立索引</el-dropdown-item>
              <el-dropdown-item>设置</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>-->
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      activeIndex: "1",
      height: 500,
    };
  },
  created() {
    console.log("App");
    this.getHeight();
    window.onresize = () => {
      this.getHeight();
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    getHeight() {
      console.log("getHeight");
      this.height = window.innerHeight;
    },
  },
};
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}

.el-menu-item a {
  color: #303133;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.el-menu-item.is-active a {
  color: #409eff !important;
}
</style>
