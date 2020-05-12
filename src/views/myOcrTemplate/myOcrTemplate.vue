<!--
 * @Author: nigel
 * @Date: 2020-05-11 10:31:38
 * @LastEditTime: 2020-05-12 18:22:59
 -->
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="template_wrap">
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="temp_id" :label="$t('temp_id')" width="220"></el-table-column>
      <el-table-column prop="image" :label="$t('temp_image')">
        <template slot-scope="scope">
          <img class="template_image" :src="scope.row.image" alt />
        </template>
      </el-table-column>
      <el-table-column prop="blockItem" :label="$t('custom_area')">
        <template slot-scope="scope">
          <el-table border :data="scope.row.blockItem" style="width: 100%">
            <el-table-column prop="ocr_engine" :label="$t('ocr_engine')"></el-table-column>
            <el-table-column prop="name" :label="$t('ocr_name')"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operation')" align="center" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">{{ $t('edit') }}</el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index)"
          >{{ $t('delete') }}</el-button>
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
// import api from "../../api";
export default {
  data() {
    return {
      tableData: []
    };
  },
  computed: {
    ...mapState({
      locals: state => state.menuStore.locals
    })
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    }
  },
  mounted() {
    this.tableData = storeSession.get("templateData") || [];
  },
  destroyed() {},
  methods: {
    /**
     * @name: handleEdit
     * @msg: 编辑我的模板
     * @param {row}
     * @return:
     */
    handleEdit(row) {
      this.$router.push({
        name: "customizeOcr",
        params: row
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
        type: "warning"
      })
        .then(() => {
          this.tableData.splice(index, 1);
          storeSession.set("templateData", this.tableData);
          this.$message({
            type: "success",
            message: this.$t("cancel_succ")
          });
        })
        .catch(() => {
          console.log("cancel delete");
        });
    }
  }
};
</script>
