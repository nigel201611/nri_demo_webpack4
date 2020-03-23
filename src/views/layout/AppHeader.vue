<i18n src="./locals/AppHeader.json"></i18n>
<template>
  <el-col :span="24" class="header">
    <el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
      {{collapsed?sysName:''}}
      <img :src="logoSrc" v-show="!collapsed" />
    </el-col>
    <el-col :span="10">
      <div class="tools" @click.prevent="collapse">
        <i class="fa fa-align-justify"></i>
      </div>
    </el-col>

    <el-col :span="4" class="language-set">
      <el-dropdown class="userinfo" trigger="hover">
        <span class="el-dropdown-link userinfo-inner">
          {{userName}}
          <i class="fa fa-user-o"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown @command="handleSetLanguage">
        <span class="el-dropdown-link userinfo-inner">
          {{$t(languageMap[locals])}}
          <span class="iconfont icon-lang langati"></span>
          <!-- <i class="el-icon-arrow-down el-icon--right"></i> -->
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(value,key) in languageMap"
            :key="key"
            :command="key"
          >{{$t(value)}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
  </el-col>
</template>

<script>
import { mapActions, mapState } from "vuex";
import api from "../../api";
import logoSrc from "../../assets/nri_logo.png";

export default {
  data() {
    return {
      sysName: "NRI",
      activeIndex: "1",
      activeIndex2: "1",
      userName: "",
      userAvatar: "",
      logoSrc: logoSrc,
      languageMap: {
        "zh-CH": "chinese",
        en: "english",
        ja: "japanese"
      }
    };
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    }
  },
  methods: {
    ...mapActions(["collapse", "setLocals"]),
    handleSetLanguage(key) {
      // 语言设置到vuex中
      this.setLocals(key);
    },

    logout() {
      this.$confirm("是否要退出?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        localStorage.clear();
        sessionStorage.clear();
        this.$router.replace({
          name: "login"
        });
      });
    }
  },
  computed: {
    ...mapState({
      collapsed: state => state.menuStore.collapsed
    }),
    ...mapState({
      locals: state => state.menuStore.locals
    })
    // ...mapState({
    //   userinfo: state => state.accountStore.accountInfo
    // })
  },
  created() {
    // this.userName = "nigel";
  },
  mounted() {
    let userInfo = storeLocal.get("userInfo");
    // console.log(userInfo);
    if (userInfo) {
      this.userName = userInfo.username;
    }
  }
};
</script>
<style scoped lang="scss">
@import "~scss_vars";

.header {
  height: 60px;
  line-height: 60px;
  background: $color-primary;
  color: #fff;
  .langati {
    position: relative;
    top: 2px;
    font-size: 20px;
  }
  .userinfo {
    margin: 0 10px 0 0;
  }
  .language-set {
    text-align: right;
    padding-right: 15px;
    float: right;
    .userinfo-inner {
      cursor: pointer;
      color: #fff;
      img {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        margin: 10px 0px 10px 10px;
        float: right;
      }
    }
  }
  .logo {
    //width:$sidebar-width;
    height: 60px;
    font-size: 22px;
    // padding-left: 12px;
    // padding-right: 20px;
    border-color: rgba(238, 241, 146, 0.3);
    border-right-width: 1px;
    border-right-style: solid;
    text-align: center;
    img {
      // float: left;
      width: 100%;
      // width: 94px;
      height: 60px;
      // margin: 10px 0 0 0;
      // margin: 0 auto;
      padding: 0;
    }
    .txt {
      color: #fff;
    }
  }
  .logo-width {
    width: $sidebar-width;
  }
  .logo-collapse-width {
    width: $collapse-sidebar-width;
  }
  .tools {
    padding: 0px 23px;
    width: 14px;
    height: 60px;
    line-height: 60px;
    cursor: pointer;
  }
}
</style>
