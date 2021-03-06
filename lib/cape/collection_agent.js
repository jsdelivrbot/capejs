'use strict'

let Inflector = require('inflected')
let Cape = require('./utilities')

// Cape.CollectionAgent
//
// public properties:
//   resourceName: the name of resource
//   basePath: the string that is added to the request path. Default value is '/'.
//   nestedIn: the string that is inserted between path prefix and the resource
//     name. Default value is ''.
//   shallow: a boolean value that controls whether the agent should omit
//     the `nestedIn` string from the member path. Default is `false`.
//   adapter: the name of adapter (e.g., 'rails'). Default is undefined.
//     Default value can be changed by setting Cape.defaultAgentAdapter property.
//   autoRefresh: a boolean value that controls unsafe Ajax requests trigger
//     this.refresh(). Default is `true`.
//   dataType: the type of data that you're expecting from the server.
//     The value must be 'json', 'text' or undefined. Default is undefiend.
//     When the `dataType` option is not defined, the type is detected automatically.
//   paramName: the name of parameter to be used when the `objects`
//     property is initialized and refreshed. Default is undefiend.
//     When the `paramName` option is not defined, the name is derived from the
//     `resourceName` property, e.g. `user` if the resource name is `users`.
//   objects: the array of objects that represent the collection of resources
//   data: the response data from the server. This property holds an object
//     if the response data is a valid JSON string. Otherwise, it holds the
//     original string value.
//   headers: the HTTP headers for Ajax requests
// private properties:
//   _: the object that holds internal methods and properties of this class.
//
// parameters for the constructor
//   options: an object that is used to initialize properties. The properties
//     which can be initialized by it are `resourceName`, `basePath`,
//     `nestedIn`, `adapter`, `autoRefresh`, `dataType`, and `paramName`.
//
class CollectionAgent {
  constructor(client, options) {
    this._ = new _Internal(this)
    this.init(options)

    this.client = client
    this.objects = []
    this.data = undefined
    this.headers = { 'Content-Type': 'application/json' }
  }

  init(options) {
    options = options || {}
    this.resourceName = options.resourceName
    this.basePath = options.basePath
    this.nestedIn = options.nestedIn
    this.shallow = options.shallow || false
    this.adapter = options.adapter
    this.autoRefresh = options.autoRefresh
    if (this.autoRefresh === undefined) this.autoRefresh = true
    this.dataType = options.dataType
    this.paramName = options.paramName
  }

  // Fetch current data through the API and refresh this.objects.
  //
  // The default implementation assumes that the request URI has no query string and
  // the API returns a hash like this:
  //   { users: [ { id: 1, name: 'John' }, { id: 2, name: 'Kate' } ]}
  //
  // Developers may change this assumption by overriding the `paramsForRefresh()`
  // method or setting the `paramName` property.
  refresh() {
    let self = this
    this.index(this.paramsForRefresh(), data => {
      self.data = data
      self.refreshObjects(data)
      self.afterRefresh()
    })
  }

  // Returns an empty object always. This object is used to construct
  // the query string of the request URL during the `refresh()` process.
  //
  // Developers may override this method to change this behavior.
  paramsForRefresh() {
    return {}
  }

  // Refresh the `objects` property using the response data from the server.
  //
  // Developers may override this method to change its default behavior.
  refreshObjects(data) {
    let paramName = this.paramName || Inflector.tableize(this.resourceName)

    this.objects.length = 0
    if (typeof data === 'object' && Array.isArray(data[paramName])) {
      for (let i = 0; i < data[paramName].length; i++) {
        this.objects.push(data[paramName][i])
      }
    }
  }

  // Called by the `refresh()` method after it updates the `data` and
  // `objects` properties.
  //
  // Developers may override this method to let the agent do some
  // post-processing jobs.
  afterRefresh() {
    this.client.refresh()
  }

  index(params, callback, errorHandler) {
    this.get('', null, params, callback, errorHandler)
  }

  create(params, callback, errorHandler) {
    this.post('', null, params, callback, errorHandler)
  }

  update(id, params, callback, errorHandler) {
    this.patch('', id, params, callback, errorHandler)
  }

  destroy(id, callback, errorHandler) {
    this.delete('', id, {}, callback, errorHandler)
  }

  get(actionName, id, params, callback, errorHandler) {
    this._.http_request('GET', actionName, id, params, callback, errorHandler)
  }

  head(actionName, id, params, callback, errorHandler) {
    this._.http_request('HEAD', actionName, id, params, callback, errorHandler)
  }

  post(actionName, id, params, callback, errorHandler) {
    this._.http_request('POST', actionName, id, params, callback, errorHandler)
  }

  patch(actionName, id, params, callback, errorHandler) {
    this._.http_request('PATCH', actionName, id, params, callback, errorHandler)
  }

  put(actionName, id, params, callback, errorHandler) {
    this._.http_request('PUT', actionName, id, params, callback, errorHandler)
  }

  delete(actionName, id, params, callback, errorHandler) {
    this._.http_request('DELETE', actionName, id, params, callback, errorHandler)
  }

  collectionPath() {
    let resources = Inflector.pluralize(Inflector.underscore(this.resourceName))
    return this._.pathPrefix() + resources
  }

  memberPath(id) {
    let resources = Inflector.pluralize(Inflector.underscore(this.resourceName))
    return this._.pathPrefix(this.shallow) + resources + '/' + id
  }

  defaultErrorHandler(ex) {
    console.log(ex)
  }
}

let AgentCommonMethods = require('./mixins/agent_common_methods')
Object.assign(CollectionAgent.prototype, AgentCommonMethods)

// Internal properties of Cape.CollectionAgent
class _Internal {
  constructor(main) {
    this.main = main
    this.components = []
  }

  http_request(verb, actionName, id, params, callback, errorHandler) {
    let path = id ? this.main.memberPath(id) : this.main.collectionPath()
    if (actionName !== '') path = path + '/' + actionName
    this.main.ajax(verb, path, params, callback, errorHandler)
  }
}

let AgentCommonInnerMethods = require('./mixins/agent_common_inner_methods')

// Internal methods of Cape.CollectionAgent
Object.assign(_Internal.prototype, AgentCommonInnerMethods)

module.exports = CollectionAgent
