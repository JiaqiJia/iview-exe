// script引入脚本
import { GetContentListByStatus, GetContentCheckDetailsByGUID} from '@/api/processInspection'
import baseURL from '_conf/url'
import { OperationStyle, TypeFlag } from '@/libs/const'
import progressInspection from '../progress-component/progressInspectionDetail.vue'

// 脚本输出
export default {
  name: 'progress_response_page',
  components: {
  progressInspection},
  data: function () {
    return {
      // 基本信息
      baseURL: baseURL,
      TypeFlag: TypeFlag,
      typeFlag: TypeFlag.ProgressResponse,
      OperationType: OperationStyle,
      operationType: '',
      opertionValue: {},

      // 分页信息
      PageNumber: 1,
      PageSize: 10,
      Count: 0,

      // Tab组件信息
      tabName: 'name1',
      // 已处理报验请求中的过滤，三种类型 received，returned， all(默认)
      filterType: 'all',
      // 选择器信息
      selectOptions: [
        {
          value: 'all',
          label: '-'
        },
        {
          value: 'received',
          label: '通过请求'
        },
        {
          value: 'returned',
          label: '退回重发'
        }
      ],

      // 表格组件的状态列信息
      // 载入状态
      loading: true,
      // 未处理表格的列
      unresStatusObj: {
        title: '超期响应',
        key: 'timeout',
        align: 'center',
        render: (h, params) => {
          const row = params.row
          const deadline = new Date(row.CheckDeadLine)
          // 根据设计，响应时间在监理状态是 2 的时候 必定为空，
          // 但是 后端对于空时间返回的是 "0001-01-01T00:00:00Z"
          // 简单的处理方法：直接获取当前时间
          let checkTime = new Date()
          let timeout =
          deadline.getTime() - checkTime.getTime() < 0 ? true : false
          let text = timeout ? '超时未响应' : '待响应'
          return h(
            'Tag',
            {
              props: {
                type: 'dot',
                color: timeout ? '#ed3f14' : '#ffad33'
              }
            },
            text
          )
        }
      },
      // 已处理表格的列
      resStatusObj: {
        title: '响应状态',
        key: 'rStatus',
        align: 'center',
        render: (h, params) => {
          const row = params.row
          // 根据监理状态设置显示内容
          let accepted = row.AuditStatus === 3 ? true : false
          let text = accepted ? '同意共检' : '退回再编辑'
          return h(
            'Tag',
            {
              props: {
                type: 'dot',
                color: accepted ? '#19be6b' : '#ed3f14'
              }
            },
            text
          )
        }
      },

      // 返回数据的表格信息
      columns: [
        {
          title: '单位工程',
          key: 'SubProjectName',
          tooltip: true
        },
        {
          title: '分部名称',
          key: 'SubSectionProjectName',
          tooltip: true
        },
        {
          title: '分项名称',
          key: 'ProjectItemName',
          tooltip: true
        },
        {
          title: '检验批次',
          key: 'InspectItemName',
          tooltip: true
        },
        {
          title: '工序名称',
          key: 'BaseWorkContentName',
          // width: 200,
          tooltip: true
        },
        // 申请人列动态配置 位置为5
        {
          title: '检验人',
          key: 'CollaborationUserName',
          tooltip: true
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  nativeOn: {
                    click: event => {
                      event.stopPropagation()
                      this.showDetail(params.row)
                    }
                  }
                },
                this.tabName === 'name1' ? '响应' : '详情'
              )
            ])
          }
        }
      ],
      // 接收到的信息
      requestsData: []
    }
  },

  //生命周期钩子，对于 Table columns 的问题，这个钩子函数是没有问题的，
  //但是具体的原因还需要探索，目前能确定的是：
  //将一个响应式属性赋值到另一个响应式属性上是不安全的，因为处在 vm 实例创建的过程中，情况是不确定的
  //尤其是使用 methods 里面定义的函数赋初始值的时候，目前已知是确定 vue 会报错的。
  mounted() {
    this.$nextTick(function () {
      this.getRequestsList(this.tabName)
    })
  },
  

  methods: {
    // 获取需要类型的请求的列表
    getRequestsList(name) {
      this.loading = true
      var status = null
      switch (name) {
        case 'received':
          status = [3]
          break
        case 'returned':
          status = [4]
          break
        case 'name1':
          status = [2]
          break
        case 'name2':
          status = [3, 4]
          break
        default:
          alert('请求参数名不在范围内：name')
          return
      }
      // 配置数据表格的 列名集合
      this.getColumns(name)
      // 配置网络请求数据
      var fdata = {
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        StatusList: status
      }
      this.getDataList(fdata)
    },

    // 异步获取报验请求的数据
    getDataList(rqrdata) {
      GetContentListByStatus(rqrdata)
        .then(res => {
          if (
            res.Code == 200 &&
            res.Data.ContentCheckList.length != 0 // &&
          // res.Data.ContentCheckList[0].GUID !== ""
          ) {
            this.requestsData = res.Data.ContentCheckList
            this.loading = false
            this.Count = res.Data.Count
            this.PageNumber = res.Data.PageNumber
            this.PageSize = res.Data.PageSize
          } else {
            this.requestsData = []
            this.loading = false
            this.resetPaging()
          }
          this.columnAddFilter()
        })
        .catch(reason => {
          this.requestsData = []
          this.loading = false
          this.resetPaging()
          this.columnAddFilter()
        })
    },


    showDetail(rowData) {
      // 展开右侧菜单，并显示该行数据的内容
      this.operationValue = rowData
      this.operationType = this.OperationType.show
    },
    // 监听右边栏组件的回调方法，针对未响应请求的响应处理，需要重新获取列表
    updateChange() {
      if (this.requestsData.length == 1 && this.PageSize != 1) {
        this.PageNumber--
      }
      this.getRequestsList(this.tabName)
    },
    // ==========================================================
    // 以下两个方法的功能已经被上面的方法完成，虽然定义了，但并没有使用
    acceptReq() {
      // 监理批准通过该请求
    },
    returnReq() {
      // 监理退回请求
    },
    // ==========================================================

    // Page组件的相关功能
    adjustPage(pageNum) {
      this.PageNumber = pageNum
      this.pageActionRefresh()
    },
    adjustPageSize(pageSize) {
      this.PageSize = pageSize
      this.pageActionRefresh()
    },
    pageActionRefresh() {
      if (this.tabName === 'name2') {
        let type = this.filterType
        switch (type) {
          case 'received':
            this.getRequestsList(this.filterType)
            break
          case 'returned':
            this.getRequestsList(this.filterType)
            break
          default:
            this.getRequestsList(this.tabName)
            break
        }
      } else {
        this.getRequestsList(this.tabName)
      }
    },

    // 更换标签时的回调函数
    changeTab(name) {
      this.tabName = name
      this.filterType = 'all'
      this.getRequestsList(name)
    },

    // 根据Tab的状态获取到相对应的 columns 集合
    getColumns(name) {
      if (this.columns.length === 9) {
        this.columns.splice(-2, 1)
      }
      if (name === 'name1') {
        this.columns.splice(-1, 0, this.unresStatusObj)
      } else {
        this.columns.splice(-1, 0, this.resStatusObj)
      }
    },
    // 获取到非重复的名称列表
    uniqueNamesFilter: function () {
      let arrTemp = this.requestsData.map(x => x.SelfCheckUserName)
      let itemsContainer = []

      arrTemp.forEach(item => {
        if (itemsContainer.indexOf(item) == -1) {
          itemsContainer.push(item)
        }
      })

      return itemsContainer.map(item => {
        return {
          label: item,
          value: item
        }
      })
    },
    // 添加申请人Filter
    // 该方法必须在回调函数中，数据获取之后调用。
    columnAddFilter() {
      let tempCol = {
        title: '申请人',
        key: 'SelfCheckUserName',
        tooltip: true,
        filters: this.uniqueNamesFilter(),
        filterMultiple: false,
        filterMethod(value, row) {
          return row.SelfCheckUserName == value
        }
      }
      if (this.columns[5].title === '申请人') {
        this.columns.splice(5, 1)
      }
      this.columns.splice(5, 0, tempCol)
    },


    // 根据select 组件选择项的变化筛选相应的种类
    selectSpecificType(value) {
      this.filterType = value
      if (value === 'all') {
        this.getRequestsList(this.tabName)
      } else {
        this.getRequestsList(value)
      }
    },

    // 将属性中的分页信息初始化
    resetPaging() {
      this.Count = 0
      this.PageNumber = 1
      this.PageSize = 10
    }
  }
}
