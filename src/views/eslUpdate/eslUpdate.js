import api from '../../api';
import xmldom from 'xmldom';
import { mapState } from "vuex";
// import xml2js from 'xml2js';

export default {
  data() {
    // 选项 数据
    return {
      formQuery: {
        qty: ''
      },
      formData: [],
      loading: false,
      isRequesting: false,
      sku: "",
      skuError: false,
      searchObj: null
    };
  },
  components: {
    // 定义组件
  },

  created() {
    this.isRequestingXml = false;
    this.ldLoc = "";
    this.ldLot = "";
    this.ldPart = "";
    this.ldQtyOh = "";
    this.ldSite = "";
  },

  computed: {
    ...mapState({
      locals: state => state.menuStore.locals
    }),
    eslRules() {
      const rules = {
        qty: [
          { required: true, message: this.$t('no-empty-tip') },
          { type: 'number', message: this.$t('number-tip') }
        ],
      };
      return rules;
    }
  },

  watch: {
    locals(val) {
      this.$i18n.locale = val;
    }
  },

  mounted() {
    let query = this.$route.query;
    let searchObj = query;
    this.searchObj = JSON.parse(JSON.stringify(searchObj));
    this.sku = searchObj.itemNo;
    let formData = [];
    for (let key in searchObj) {
      formData.push({
        label: key,
        value: searchObj[key],
        disable: true
      });
    }
    this.formData = formData;
    // 请求xml数据，并提取需要的数据
    this.updateQadEsl(searchObj);


  },
  methods: {
    // resetForm(formName) {
    //   this.$refs[formName].resetFields();
    // },
    parseXml(xmlStr) {
      let DOMParser = xmldom.DOMParser;
      let xmlDoc = new DOMParser().parseFromString(xmlStr, 'text/xml');

      let QryInventory = xmlDoc.getElementsByTagName("qdoc:QryInventory");
      let ldLoc = "";
      let ldLot = "";
      let ldPart = "";
      let ldQtyOh = "";
      let ldSite = "";
      if (
        QryInventory &&
        QryInventory[0] &&
        QryInventory[0].childNodes[0] &&
        QryInventory[0].childNodes[0].childNodes
      ) {
        this.skuError = false;
        ldLoc = xmlDoc.getElementsByTagName("qdoc:ldLoc")[0].textContent; //placeOfOrigin=ldLoc,specification = ldLoc,
        ldLot = xmlDoc.getElementsByTagName("qdoc:ldLot")[0].textContent; // unit=ldLot
        ldPart = xmlDoc.getElementsByTagName("qdoc:ldPart")[0].textContent; //sku=ldPart,itemName=ldPart
        ldQtyOh = xmlDoc.getElementsByTagName("qdoc:ldQtyOh")[0]
          .textContent; //price1=ldQtyOh ,qty=ldQtyOh
        ldSite = xmlDoc.getElementsByTagName("qdoc:ldSite")[0].textContent; //grade = ldSite

        this.ldLoc = ldLoc;
        this.ldLot = ldLot;
        this.ldPart = ldPart;
        this.ldSite = ldSite;

        this.ldQtyOh = ldQtyOh;
        this.formQuery.qty = +ldQtyOh;

      } else {
        this.skuError = true;
      }

    },

    //确认提交
    submitForm(formName) {
      //
      this.$refs[formName].validate((valid) => {
        if (valid) {
          console.log('submit!');
          //发送数据，请求接口，发送json数据更新esl，同时发送xml数据更新QAD
          // 3. 用户输入完确认，更新数据(qxi/service/QdocWebService)，更新库存（调用issueinventory和receiveinventory）
          let increaseQtyOrigin = this.formQuery.qty - this.ldQtyOh; //大于0增加库存，否则减少库存
          let increaseQty = Math.abs(increaseQtyOrigin);
          let issueParams = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:add="http://www.w3.org/2005/08/addressing" xmlns:urn="urn:schemas-qad-com:xml-services:common" xmlns:urn1="urn:schemas-qad-com:xml-services">
   <soapenv:Header>
      <add:ReplyTo>
         <add:Address>urn:services-qad-com:</add:Address>
      </add:ReplyTo>
      <add:ReferenceParameters>
         <urn:suppressResponseDetail>false</urn:suppressResponseDetail>
      </add:ReferenceParameters>
      <add:To>urn:services-qad-com:hvltest</add:To>
      <add:MessageID>urn:services-qad-com::hvltest</add:MessageID>
      <add:Action></add:Action>
   </soapenv:Header>
   <soapenv:Body>
    <urn1:issueInventory>
     <urn:dsSessionContext>
          
            <urn:ttContext>
               <urn:propertyQualifier>QAD</urn:propertyQualifier>
               <urn:propertyName>domain</urn:propertyName>
               <urn:propertyValue>10USA</urn:propertyValue>
            </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>username</urn:propertyName>
                    <urn:propertyValue>mfg</urn:propertyValue>
                </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>password</urn:propertyName>
                    <urn:propertyValue></urn:propertyValue>
                </urn:ttContext>
     <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>version</urn:propertyName>
                    <urn:propertyValue>eB_2 </urn:propertyValue>
                </urn:ttContext>
         </urn:dsSessionContext>
         <urn1:dsInventoryIssue>
            
            <urn1:inventoryIssue>
               
               <urn1:operation>A</urn1:operation>
               
               <urn1:ptPart>${this.ldPart}</urn1:ptPart>
               
               <urn1:lotserialQty>${increaseQty}</urn1:lotserialQty>
           
               <urn1:site>${this.ldSite}</urn1:site>
               
               <urn1:location>${this.ldLoc}</urn1:location>
               
               <urn1:lotserial>${this.ldLot}</urn1:lotserial>
     
               <urn1:issueDetail>
                  <urn1:operation>A</urn1:operation>
   
                  <urn1:ptPart>${this.ldPart}</urn1:ptPart>
                 
                  <urn1:site>${this.ldSite}</urn1:site>
                  
                  <urn1:location>${this.ldLoc}</urn1:location>
                  
                  <urn1:lotserial>${this.ldLot}</urn1:lotserial>
                
                  <urn1:lotserialQty>${increaseQty}</urn1:lotserialQty>
    
               </urn1:issueDetail>
            </urn1:inventoryIssue>
         </urn1:dsInventoryIssue>
      </urn1:issueInventory>
   </soapenv:Body>
</soapenv:Envelope>`;

          let receiveParams = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:add="http://www.w3.org/2005/08/addressing" xmlns:urn="urn:schemas-qad-com:xml-services:common" xmlns:urn1="urn:schemas-qad-com:xml-services">
   <soapenv:Header>
      <add:ReplyTo>
         <add:Address>urn:services-qad-com:</add:Address>
      </add:ReplyTo>
      <add:ReferenceParameters>
         <urn:suppressResponseDetail>false</urn:suppressResponseDetail>
      </add:ReferenceParameters>
      <add:To>urn:services-qad-com:hvltest</add:To>
      <add:MessageID>urn:services-qad-com::hvltest</add:MessageID>
      <add:Action></add:Action>
   </soapenv:Header>
   <soapenv:Body>
      <urn1:receiveInventory>
  <urn:dsSessionContext>
          
            <urn:ttContext>
               <urn:propertyQualifier>QAD</urn:propertyQualifier>
               <urn:propertyName>domain</urn:propertyName>
               <urn:propertyValue>10USA</urn:propertyValue>
            </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>username</urn:propertyName>
                    <urn:propertyValue>mfg</urn:propertyValue>
                </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>password</urn:propertyName>
                    <urn:propertyValue></urn:propertyValue>
                </urn:ttContext>
     <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>version</urn:propertyName>
                    <urn:propertyValue>eB_2 </urn:propertyValue>
                </urn:ttContext>
         </urn:dsSessionContext>
         <urn1:dsInventoryReceipt>            
            <urn1:inventoryReceipt>
               
               <urn1:operation>A</urn1:operation>
               
               <urn1:ptPart>${this.ldPart}</urn1:ptPart>
               
               <urn1:lotserialQty>${increaseQty}</urn1:lotserialQty>
               
               <urn1:site>${this.ldSite}</urn1:site>
               
               <urn1:location>${this.ldLoc}</urn1:location>
               <urn1:lotserial>${this.ldLot}</urn1:lotserial>
               
               <urn1:receiptDetail>
                  <urn1:operation>A</urn1:operation>
                  <urn1:ptPart>${this.ldPart}</urn1:ptPart>
                 
                  <urn1:site>${this.ldSite}</urn1:site>
                  
                  <urn1:location>${this.ldLoc}</urn1:location>
                  
                  <urn1:lotserial>${this.ldLot}</urn1:lotserial>
                       
               </urn1:receiptDetail>
            </urn1:inventoryReceipt>
         </urn1:dsInventoryReceipt>
      </urn1:receiveInventory>
   </soapenv:Body>
</soapenv:Envelope>`;

          // increaseQtyOrigin = 0;说明用户没有更改数量，可以不用改
          if (increaseQtyOrigin == 0) {
            this.$notify.info({
              title: this.$t('tip-text'),
              message: this.$t('qty-tip')
            });
            return;
          }
          if (increaseQtyOrigin > 0) {
            //增加库存
            if (this.isRequesting) {
              return
            }
            this.isRequesting = true;
            this.loading = true;
            api.homeApi
              .shopwebIntegrationByXml(receiveParams)
              .then(res => {
                let status = res.status;
                this.loading = false;
                this.isRequesting = false;
                // 增减库存是不是要判断下更新是否成功了，根据xml文档返回的数据判断
                if (status == 200) {
                  //更新数量
                  this.$notify({
                    title: this.$t('success-text'),
                    message: this.$t('update-succ'),
                    type: 'success'
                  });
                  this.ldQtyOh = this.formQuery.qty;

                } else {
                  this.$notify.error({
                    title: this.$t('tip-text'),
                    message: this.$t('update-fail')
                  });
                }
              })
              .catch(() => {
                this.loading = false;
                this.isRequesting = false;
              });
          } else if (increaseQtyOrigin < 0) {
            //减少库存
            if (this.isRequesting) {
              return
            }
            this.isRequesting = true;
            this.loading = true;
            api.homeApi
              .shopwebIntegrationByXml(issueParams)
              .then(res => {
                let status = res.status;
                this.isRequesting = false;
                this.loading = false;
                if (status == 200) {
                  this.$notify({
                    title: this.$t('success-text'),
                    message: this.$t('update-succ'),
                    type: 'success'
                  });
                  // 更新数量
                  this.ldQtyOh = this.for.formQuery.qty;

                } else {
                  this.$notify.error({
                    title: this.$t('tip-text'),
                    message: this.$t('update-fail')
                  });
                }
              })
              .catch(() => {
                this.loading = false;
                this.isRequesting = false;
              });
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    updateQadEsl(searchObj) {
      // 请求xml数据，并提取需要的数据,不更新esl，也要获取一次qad数据，或者更新qad
      let params = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:add="http://www.w3.org/2005/08/addressing" xmlns:urn="urn:schemas-qad-com:xml-services:common" xmlns:urn1="urn:schemas-qad-com:xml-services">
   <soapenv:Header>
      <add:ReplyTo>
         <add:Address>urn:services-qad-com:</add:Address>
      </add:ReplyTo>
      <add:ReferenceParameters>
         <urn:suppressResponseDetail>false</urn:suppressResponseDetail>
      </add:ReferenceParameters>
      <add:MessageID>urn:services-qad-com::hvltesto</add:MessageID>
      <add:To>urn:services-qad-com:hvltesto</add:To>
      <add:Action></add:Action>
   </soapenv:Header>
     <soapenv:Body>
      <urn1:queryQryInventory>
         <urn:dsSessionContext>
               <urn:ttContext>
               <urn:propertyQualifier>QAD</urn:propertyQualifier>
               <urn:propertyName>domain</urn:propertyName>
               <urn:propertyValue>10USA</urn:propertyValue>
            </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>username</urn:propertyName>
                    <urn:propertyValue>nriadm</urn:propertyValue>
                </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>password</urn:propertyName>
                    <urn:propertyValue>nomurahk</urn:propertyValue>
                </urn:ttContext>
                    <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>version</urn:propertyName>
                    <urn:propertyValue>ERP3_1 </urn:propertyValue>
                </urn:ttContext>

         </urn:dsSessionContext>
               <urn1:dsQueryServiceRequest>            
            <urn1:QueryServiceRequest>
                 
               <urn1:SourceApplication>hvltest</urn1:SourceApplication>
               <urn1:Profile>QryInventory</urn1:Profile>
                 <urn1:Filter>ld_site="${searchObj.Site}" and ld_Part="${
        searchObj.itemNo
        }" and ld_loc="${searchObj.Location}" and ld_lot="${searchObj.LotNO}"
    </urn1:Filter>
               <urn1:MaxRows>1</urn1:MaxRows>
               <urn1:IgnoreBOFilter>false</urn1:IgnoreBOFilter>
               <urn1:IgnoreBOInnerJoin>false</urn1:IgnoreBOInnerJoin>
            </urn1:QueryServiceRequest>
         </urn1:dsQueryServiceRequest>
      </urn1:queryQryInventory>
   </soapenv:Body>
</soapenv:Envelope>`;

      // batchNo=1,sku=ldPart,itemName=ldPart,price1=ldQtyOh,placeOfOrigin=ldLoc,qrCode--前端写入grade = ldSite， specification = ldLoc, unit=ldLot

      if (this.isRequestingXml) {
        return;
      }
      this.loading = true;
      this.isRequestingXml = true;
      api.homeApi
        .shopwebIntegrationByXml(params)
        .then(res => {
          // console.log(res.data);
          this.loading = false;
          let status = res.status;
          this.isRequestingXml = false;
          let xmlObj = res.data;
          if (status == 200 && xmlObj.errno == 0) {
            // 本地测试机使用这个
            // this.parseXml(res.data);
            // 云服务器使用这个，注意区分
            // console.log(xmlObj.data.xmldata);
            this.parseXml(xmlObj.data.xmldata);
          }

        })
        .catch(res => {
          this.isRequestingXml = false;
          this.loading = false;
          this.skuError = true;
          this.$notify({
            title: this.$t('warning-text'),
            message: this.$t('no-related-result'),
            type: 'warning'
          });
        });
    }
  }
};