/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "MyWeb": {
      "type": "sst.aws.StaticSite"
      "url": string
    }
  }
}
export {}
