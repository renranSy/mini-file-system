declare namespace API {
  type Response<T> = {
    code: number
    data: T
    message: string
  }

  export interface LoginReq {
    username: string
    password: string
  }

  export interface LoginRes {
    token: string
    username: string
    userId: number
  }

  export interface QueryFile {
    id: number
    uuid: string
    hash: string
    userId: string
    filename: string
    filesize: number
    filetype: string
    createdAt: string
  }

  export interface QueryFileRes {
    list: QueryFile[]
  }
}
