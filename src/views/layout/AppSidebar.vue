<i18n src="./locals/AppSidebar.json"></i18n>
<template>
  <aside :class="collapsed ? 'menu-collapsed' : 'menu-expanded'">
    <el-menu
      theme="dark"
      :default-active="$route.path"
      class="el-menu-vertical"
      background-color="#324157"
      text-color="#bfcbd9"
      active-text-color="#20a0ff"
      unique-opened
      router
      :collapse="collapsed"
      :default-openeds="openedIndex"
      @open="handleopen"
      @close="handleclose"
      @select="handleselect"
    >
      <template v-for="(item, index) in menus">
        <el-submenu
          v-if="!item.leaf && !item.hidden"
          :key="index + ''"
          :index="index + ''"
        >
          <template slot="title">
            <i :class="item.iconCls" />
            <span slot="title">{{ $t(item.alias || item.name) }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            <span v-if="!child.hidden">{{
              $t(child.alias || child.name)
            }}</span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item
          v-if="item.leaf && !item.hidden"
          :key="item.path"
          :index="item.path"
        >
          <i :class="item.iconCls" />
          <span slot="title">{{ $t(item.alias || item.name) }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>
<script>
import { mapState } from "vuex";
import util from "../../common/js/util";

export default {
  data() {
    return {
      menus: null,
      openedIndex: [],
    };
  },
  computed: {
    ...mapState({
      collapsed: (state) => state.menuStore.collapsed,
    }),
    ...mapState({
      locals: (state) => state.menuStore.locals,
    }),
  },
  watch: {
    //解决menu收缩后在展开，子菜单不展开的问题
    collapsed: {
      handler(curVal) {
        //菜单收缩，不进行此操作,curVal=true表示收缩
        if (curVal) {
          return;
        }
        this.openMenu();
      },
    },
    locals(val) {
      this.$i18n.locale = val;
    },
  },
  created() {
    let tempMenus = [];
    const menudata = [
      {
        id: 67,
        permName: "esl-update",
        parentPermId: 0,
        permCode: "",
        permType: "MENU",
        permUrl: "/eslUpdate?itemNo=009&Site=10-100&Location=010&LotNO=111",
        iconClass: "fa fa-android",
        permDesc: "esl-update",
      },
      {
        id: 69,
        permName: "intelligent-identification-API",
        parentPermId: 0,
        permCode: "",
        permType: "MENU",
        permUrl: "",
        iconClass: "fa fa-linux",
        permDesc: "intelligent-identification-API",
      },
      {
        id: 70,
        permName: "smoke-face-recognition",
        parentPermId: 69,
        permCode: "",
        permType: "MENU",
        permUrl: "/dectectApi",
        iconClass: "",
        permDesc: "smoke-face-recognition",
      },
      {
        id: 71,
        permName: "ocr-recognition",
        parentPermId: 0,
        permCode: "",
        permType: "MENU",
        permUrl: "",
        iconClass: "fa fa-bell-o",
        permDesc: "ocr-recognition",
      },
      {
        id: 72,
        permName: "waybill-recognition",
        parentPermId: 71,
        permCode: "",
        permType: "MENU",
        permUrl: "/ocr",
        iconClass: "fa fa-bell-o",
        permDesc: "waybill-recognition",
      },
      {
        id: 73,
        permName: "zipcode-recognition",
        parentPermId: 71,
        permCode: "",
        permType: "MENU",
        permUrl: "/postCodeOcr",
        iconClass: "fa fa-bell-o",
        permDesc: "zipcode-recognition",
      },
      {
        id: 74,
        permName: "self-defined-area-recognition",
        parentPermId: 71,
        permCode: "",
        permType: "MENU",
        permUrl: "/drawImg",
        iconClass: "fa fa-bell-o",
        permDesc: "self-defined-area-recognition",
      },
      {
        id: 75,
        permName: "self-defined-ocr",
        parentPermId: 71,
        permCode: "",
        permType: "MENU",
        permUrl: "/customizeOcr",
        iconClass: "fa fa-bell-o",
        permDesc: "self-defined-ocr",
      },
      // {
      //   id: 75,
      //   permName: "opencamera",
      //   parentPermId: 0,
      //   permCode: "",
      //   permType: "MENU",
      //   permUrl: "/opencamera",
      //   iconClass: "fa fa-camera",
      //   permDesc: "opencamera"
      // },
      {
        id: 76,
        permName: "tencent-general",
        parentPermId: 0,
        permCode: "",
        permType: "MENU",
        permUrl: "",
        iconClass: "iconfont icon-Penguin",
        permDesc: "tencent-general",
      },
      {
        id: 77,
        permName: "printed-character-recog",
        parentPermId: 76,
        permCode: "",
        permType: "MENU",
        permUrl: "/generalocr",
        iconClass: "iconfont icon-Penguin",
        permDesc: "printed-character-recog",
      },
      {
        id: 82,
        permName: "google-general",
        parentPermId: 0,
        permCode: "",
        permType: "MENU",
        permUrl: "",
        iconClass: "iconfont icon-google",
        permDesc: "google-general",
      },
      {
        id: 83,
        permName: "printed-character-recog",
        parentPermId: 82,
        permCode: "",
        permType: "MENU",
        permUrl: "/googleOcr",
        iconClass: "",
        permDesc: "printed-character-recog",
      },
      {
        id: 84,
        permName: "slice-upload",
        parentPermId: 0,
        permCode: "",
        permType: "MENU",
        permUrl: "/sliceUpload",
        iconClass: "",
        permDesc: "slice-upload",
      },
    ];
    menudata.forEach(function (element) {
      //菜单映射
      let temp = {};
      temp.id = element.id;
      temp.path = element.permUrl;
      temp.alias = element.permName;
      temp.name = element.permName;
      temp.iconCls = element.iconClass;
      temp.hidden = element.hidden;
      temp.parentPermId = element.parentPermId;
      tempMenus.push(temp);
    }, this);

    let treeData = util.listToTree(tempMenus, { parentKey: "parentPermId" });

    treeData.forEach((element) => {
      if (!element.children || element.children.length == 0) {
        element.leaf = true;
      }
    });
    this.menus = treeData;
    this.openMenu();
    // api.menu.getMenuList().then(res => {
    //   if (!res.data.data || res.data.data.length == 0) {
    //     this.$router.push({ path: "/login" });
    //   }

    //   let tempMenus = [];
    //   res.data.data.forEach(function(element) {
    //     //菜单映射
    //     let temp = {};
    //     temp.id = element.id;
    //     temp.path = element.permUrl;
    //     temp.alias = element.permName;
    //     temp.name = element.permName;
    //     temp.iconCls = element.iconClass;
    //     temp.hidden = element.hidden;
    //     temp.parentPermId = element.parentPermId;
    //     tempMenus.push(temp);
    //   }, this);

    //   let treeData = util.listToTree(tempMenus, { parentKey: "parentPermId" });

    //   treeData.forEach((element, index) => {
    //     if (!element.children || element.children.length == 0) {
    //       element.leaf = true;
    //     }
    //   });
    //   this.menus = treeData;
    //   this.openMenu();
    // });
  },
  methods: {
    openMenu() {
      this.menus.forEach((element, index) => {
        if (element.children) {
          //找到要展开的标签
          element.children.forEach((ele) => {
            if (ele.path == this.$route.path) {
              this.openedIndex.push(index + "");
            }
          });
        }
      });
    },
    onSubmit() {
      console.log("submit!");
    },
    handleopen() {},
    handleclose() {},
    handleselect() {},
  },
};
</script>

<style scoped lang="scss">
@import "~scss_vars";

aside {
  flex: 0 0 $sidebar-width;
  width: $sidebar-width;
  .el-menu {
    height: 100%;
  }
}

.menu-collapsed {
  flex: 0 0 $collapse-sidebar-width;
  width: $collapse-sidebar-width;
  .el-menu-item {
    min-width: 0;
  }
}

.menu-expanded {
  flex: 0 0 $sidebar-width;
  width: $sidebar-width;
}

.el-menu {
  overflow: hidden;
}
.el-submenu .el-menu-item span {
  margin: 0 0 0 10px;
  display: inline-block;
}
</style>
