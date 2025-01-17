本文翻译自  [Intercepting JavaScript Fetch API requests and responses](https://blog.logrocket.com/intercepting-javascript-fetch-api-requests-responses/)\
本文翻译自 拦截 JavaScript Fetch API 请求和响应

拦截器是可用于预处理或后处理 HTTP 请求的代码块，有助于全局错误处理、身份验证、日志记录等。在本文中，你将学习如何[拦截 JavaScript Fetch API 请求](https://blog.logrocket.com/axios-vs-fetch-best-http-requests/)。

拦截 HTTP 请求一般有两种事件：请求和响应事件。请求拦截器应该在发送实际 HTTP 请求之前执行，而响应拦截器应该在到达发出请求的应用程序代码之前执行。

在深入研究代码之前，我们需要了解一些重要的事情。首先，[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)  本身不支持拦截器。其次，在 Node.js 中使用 Fetch API 需要额外的包。

## JavaScript Fetch API

首先，让我们介绍一些 Fetch API 的基础，例如语法:

```js
const fetchResponsePromise = fetch(resource [, init])
```

`resource`  定义要获取的资源，该资源可以是  [Request 对象](https://developer.mozilla.org/en-US/docs/Web/API/Request)，也可以是 URL。`init`  是一个可选对象，它将包含你想应用于此特定请求的任何自定义配置。

Fetch API 是基于 Promise 的。因此，当你调用 Fetch 方法时，你将得到一个 Promise 响应。在这里，它被称为  `fetchResponsePromise`，如上面的示例所示。

默认情况下，Fetch 使用  `GET`  方法调用 API，如下所示:

```js
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))
```

下面是一个使用 Fetch 发送  `POST`  请求的示例:

```js
fetch('https://jsonplaceholder.typicode.com/todos', {
  method: 'POST',
  body: JSON.stringify({
    completed: false,
    id: 1,
    title: 'New Todo',
    userId: 1
  }),
  headers: new Headers({
    'Content-Type': 'application/json; charset=UTF-8'
  })
})
  .then(response => response.json())
  .then(json => console.log(json))
```

`POST`  请求必须有  `body`。 查看  [Fetch 文档](https://developer.mozilla.org/en-US/docs/Web/API/fetch)  了解更多详细信息。

## 实现拦截

有两种方法可以在 Fetch API 请求时添加拦截器：使用猴子补丁或者使用库  [`fetch-intercept`](https://github.com/werk85/fetch-intercept)。

## 对 Fetch 使用猴子补丁（monkey patching）

为任何 JavaScript 函数或方法创建拦截器的一种方法是对其进行猴子修补。猴子补丁是一种用自己的函数版本覆盖原始函数的方法。

让我们一步一步地看看如何使用猴子补丁为 Fetch API 创建拦截器:

```js
const { fetch: originalFetch } = window

window.fetch = async (...args) => {
  let [resource, config] = args
  // request interceptor here
  const response = await originalFetch(resource, config)
  // response interceptor here
  return response
}
```

上面的代码使用自定义实现重写原始 Fetch 方法，并在其中调用原始 Fetch 方法。你可以使用这个样例代码来创建请求和响应拦截器。

## 请求拦截器

在下面的示例中，我们将创建一个简单的请求拦截器，用于更改一个请求示例的 URL:

```js
const { fetch: originalFetch } = window
window.fetch = async (...args) => {
  let [resource, config] = args

  // request interceptor starts
  resource = 'https://jsonplaceholder.typicode.com/todos/2'
  // request interceptor ends

  const response = await originalFetch(resource, config)

  // response interceptor here
  return response
}

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))

// log
// {
//   "userId": 1,
//   "id": 2,
//   "title": "quis ut nam facilis et officia qui",
//   "completed": false
// }
```

这个 API 请求将从  `https://jsonplaceholder.typicode.com/todos/2`  获取数据，而不是  `https://jsonplaceholder.typicode.com/todos/1`，并展示 ID 为  `2`  的  `todo`  数据。

_注意: 请求拦截器最常见的用例之一是更改身份验证的 headers。_

## 响应拦截器

响应拦截器将在 API 响应传递给实际调用者之前拦截它。让我们看看下面的代码:

```js
const { fetch: originalFetch } = window
window.fetch = async (...args) => {
  let [resource, config] = args

  let response = await originalFetch(resource, config)

  // response interceptor
  const json = () =>
    response
      .clone()
      .json()
      .then(data => ({ ...data, title: `Intercepted: ${data.title}` }))

  response.json = json
  return response
}

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))

// log
// {
//     "userId": 1,
//     "id": 1,
//     "title": "Intercepted: delectus aut autem",
//     "completed": false
// }
```

在上面的代码中，我们更改了  `json`  方法以返回一些自定义数据来替代原始数据。查看文档了解更多  [可以更改的属性](https://developer.mozilla.org/en-US/docs/Web/API/Response)。

注意: `response`  只允许使用一次。因此，每次需要使用  `response`  时，都需要  [克隆 response](https://developer.mozilla.org/en-US/docs/Web/API/Response/clone)。

## 错误处理

通过检查  `response.ok`  和  `response.status`  的值，可以很容易地处理请求的错误。在下面的代码片段中，可以拦截 404 错误

```js
const { fetch: originalFetch } = window
window.fetch = async (...args) => {
  let [resource, config] = args
  let response = await originalFetch(resource, config)
  if (!response.ok && response.status === 404) {
    // 404 error handling
    return Promise.reject(response)
  }
  return response
}
fetch('https://jsonplaceholder.typicode.com/todos/1000000')
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(error => console.error(error))
```

## Node.js

你可以在 Node.js 中使用相同的方法。然而，Node.js 原生不支持 Fetch API (尽管对 Fetch API 的原生支持将在 Node.js 的[未来版本中提供](https://github.com/nodejs/node/pull/41749))。现在，你需要安装  [Node Fetch](https://github.com/node-fetch/node-fetch)  包，然后对  `fetch`  方法使用猴子补丁。【译：Node18 已经支持了！】

## 使用 fetch-intercept 库

如果你不喜欢做这些  `dirty`  的事情(双关语【译：我也不懂指什么？】) ，那么  [fetch-intercept](https://github.com/werk85/fetch-intercept)  库允许您使用更干净的 API 注册拦截器。您可以使用 npm 或 Yarn 来安装这个库，如下所示:

```bash
npm install fetch-intercept whatwg-fetch --save
// or
yarn install fetch-intercept whatwg-fetch
```

_注意: fetch-intercept 只支持浏览器，不能在 Node.js 中工作。因此，它还需要使用  [whatwg-fetch](https://github.com/whatwg/fetch)  作为依赖项。_

通过下面的代码，我们可以实现与我们的猴子补丁示例相同的请求和响应拦截器:

```js
import * as fetchIntercept from 'fetch-intercept'

const unregister = fetchIntercept.register({
  request: function(url, config) {
    const modifiedUrl = `https://jsonplaceholder.typicode.com/todos/2`
    return [modifiedUrl, config]
  },

  requestError: function(error) {
    return Promise.reject(error)
  },

  response: function(response) {
    const clonedResponse = response.clone()
    const json = () => clonedResponse.json().then(data => ({ ...data, title: `Intercepted: ${data.title}` }))

    response.json = json
    return response
  },

  responseError: function(error) {
    return Promise.reject(error)
  }
})

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))

// unregister interceptors
unregister()
```

`register`  方法允许你为 Fetch API 请求注册拦截器。它接受一个带有  `request`, `requestError`, `response`, 和  `responseError`  回调的对象。`register`  方法返回另一个可用于注销拦截器的方法。

Fetch API 本身不支持拦截器。但是，还有其他支持拦截器的 HTTP 请求库。看一下  [Axios](https://axios-http.com/docs/interceptors)，它提供了开箱即用的功能。

## 总结

在本文中，我们介绍了什么是 JavaScript 拦截器，学习了如何通过给 Fetch API 使用猴子补丁和使用 fetch-intercept 库来创建拦截器。

拦截器最初由 Angular 引入，对于各种各样的用例都很有帮助，比如帮助处理全局错误、身份验证、日志记录等等。你可以使用本文描述的方法将拦截器添加到 JavaScript 应用程序中，但是，请记住在 Node.js 需要添加额外的依赖。

我希望你喜欢这篇文章，如果有任何问题一定要留下评论。Happy coding!
