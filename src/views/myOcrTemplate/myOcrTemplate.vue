<!--
 * @Author: nigel
 * @Date: 2020-05-11 10:31:38
 * @LastEditTime: 2020-10-26 16:10:51
 -->
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="template_wrap">
    <el-table
      v-loading="isRequesting"
      :data="tableData"
      border
      style="width: 100%"
      :empty-text="$t('no_data')"
    >
      <el-table-column
        prop="temp_id"
        :label="$t('temp_id')"
        width="220"
      ></el-table-column>
      <el-table-column prop="image" :label="$t('temp_image')">
        <template slot-scope="scope">
          <img class="template_image" :src="scope.row.image" alt />
        </template>
      </el-table-column>
      <el-table-column prop="blockItem" :label="$t('custom_area')">
        <template slot-scope="scope">
          <el-table border :data="scope.row.blockItem" style="width: 100%">
            <el-table-column
              prop="ocr_engine"
              :label="$t('ocr_engine')"
            ></el-table-column>
            <el-table-column
              prop="name"
              :label="$t('ocr_name')"
            ></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operation')" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleEdit(scope.row)"
          >{{ $t("edit") }}</el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index)"
          >{{ $t("delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.template_wrap {
  padding: 30px 10px 30px 30px;
  .template_image {
    width: 300px;
  }
}
</style>

<script>
import { mapState } from "vuex";
import api from "../../api";
export default {
  data() {
    return {
      tableData: [],
      isRequesting: false,
    };
  },
  computed: {
    ...mapState({
      locals: (state) => state.menuStore.locals,
    }),
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    },
  },
  mounted() {
    // this.tableData = storeSession.get("templateData") || [];
    this.selectUserTemplate();
  },
  destroyed() {},
  methods: {
    /**
     * @name: selectUserTemplate
     * @msg: 查找登录用户的所有模板
     * @param {type}
     * @return {type}
     */
    selectUserTemplate() {
      this.isRequesting = true;
      api.userTemplateApi
        .selectTemplate()
        .then((res) => {
          this.isRequesting = false;
          let { status, data } = res;
          if (status == 200) {
            if (data.data !== null) {
              let templateDataArr = data.data;

              templateDataArr.forEach((item, index) => {
                let blockItem = item.blockItem;
                blockItem = blockItem.replace(/\\/, "");
                templateDataArr[index].blockItem = JSON.parse(blockItem);
              });

              this.tableData = templateDataArr;
            } else {
              //提示没有模板数据
            }
          }
          // this.tableData
        })
        .catch((err) => {
          console.log(err);
          this.isRequesting = false;
        });
    },
    /**
     * @name: handleEdit
     * @msg: 编辑我的模板
     * @param {row}
     * @return:
     */
    handleEdit(row) {
      this.$router.push({
        name: "customizeOcr",
        params: row,
      });
    },
    /**
     * @name: handleDelete
     * @msg: 删除模板
     * @param {}
     * @return:
     */
    handleDelete(index) {
      this.$confirm(this.$t("confirm_text"), this.$t("Tips"), {
        confirmButtonText: this.$t("determine"),
        cancelButtonText: this.$t("cancel"),
        type: "warning",
      })
        .then(() => {
          let temp_id = this.tableData[index].temp_id;
          api.userTemplateApi
            .deleteTemplate({ temp_id: temp_id })
            .then((res) => {
              let { status, data } = res;
              // console.log(data);{ errno: 0, errmsg: "", data: 1 }
              if (status == 200) {
                if (data.errno == 0) {
                  let deleteCode = data.data;
                  if (deleteCode == 1) {
                    // 删除成功
                    this.tableData.splice(index, 1);
                    this.$message({
                      type: "success",
                      message: this.$t("cancel_succ"),
                    });
                  } else {
                    //提示用户删除失败，检查网络是否正常
                    this.$message({
                      type: "error",
                      message: this.$t("cancel_fail"),
                    });
                  }
                } else {
                  //提示没有模板数据
                }
              }
              // this.tableData
            });
        })
        .catch(() => {
          console.log("cancel delete");
        });
    },
  },
};
</script>
