export interface BlogPost {
  title: string;
  body: string;
  author: string;
  timestamp: string;
  ipfsHash: string;
}

export interface PinataMetadata {
  name: string;
  keyvalues?: {
    [key: string]: string;
  };
}

export interface PinataOptions {
  cidVersion?: number;
  customPinPolicy?: any;
}

export interface PinataRequestBody {
  pinataContent: any;
  pinataMetadata?: PinataMetadata;
  pinataOptions?: PinataOptions;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}
