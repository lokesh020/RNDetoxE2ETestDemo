/**
 * FSManager
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native'


const base64 = require('base-64');
const utf8 = require('utf8');

import {
  MkdirOptions,
  FileOptions,
  ReadDirItem,
  StatResult,
  DownloadFileOptions,
  DownloadResult,
} from './types'



const FSModule = NativeModules.FSModule

var RNFS_NativeEventEmitter = new NativeEventEmitter(FSModule);

const isIOS = Platform.OS === 'ios'

const RNFSFileTypeRegular = FSModule.RNFSFileTypeRegular;
const RNFSFileTypeDirectory = FSModule.RNFSFileTypeDirectory;

var jobId = 0;

const getJobId = () => {
  jobId += 1;
  return jobId;
};

const normalizeFilePath = (path : string) => (path.startsWith('file://') ? path.slice(7) : path);

/**
 * Generic function used by readFile and readFileAssets
 */
function readFileGeneric(filepath: string, encodingOrOptions: string | null, command: Function) {
  
  var options = {
    encoding: 'utf8'
  };

  if (encodingOrOptions) {
    if (typeof encodingOrOptions === 'string') {
      options.encoding = encodingOrOptions;
    } else if (typeof encodingOrOptions === 'object') {
      options = encodingOrOptions;
    }
  }

  return command(normalizeFilePath(filepath)).then((b64:string) => {
    var contents;

    if (options.encoding === 'utf8') {
      contents = utf8.decode(base64.decode(b64));
    } else if (options.encoding === 'ascii') {
      contents = base64.decode(b64);
    } else if (options.encoding === 'base64') {
      contents = b64;
    } else {
      throw new Error('Invalid encoding type "' + String(options.encoding) + '"');
    }

    return contents;
  });
}

/**
 * Generic function used by readDir and readDirAssets
 */
 function readDirGeneric(dirpath: string, command: Function) {
  return command(normalizeFilePath(dirpath)).then((files:any) => {
    return files.map((file:any) => ({
      ctime: file.ctime && new Date(file.ctime * 1000) || null,
      mtime: file.mtime && new Date(file.mtime * 1000) || null,
      name: file.name,
      path: file.path,
      size: file.size,
      isFile: () => file.type === RNFSFileTypeRegular,
      isDirectory: () => file.type === RNFSFileTypeDirectory,
    }));
  });
}

class FSManager {

  MainBundlePath= FSModule.RNFSMainBundlePath
  CachesDirectoryPath = FSModule.RNFSCachesDirectoryPath
  ExternalCachesDirectoryPath = FSModule.RNFSExternalCachesDirectoryPath
  DocumentDirectoryPath = FSModule.RNFSDocumentDirectoryPath
  DownloadDirectoryPath = FSModule.RNFSDownloadDirectoryPath
  ExternalDirectoryPath = FSModule.RNFSExternalDirectoryPath
  ExternalStorageDirectoryPath = FSModule.RNFSExternalStorageDirectoryPath
  TemporaryDirectoryPath = FSModule.RNFSTemporaryDirectoryPath
  LibraryDirectoryPath = FSModule.RNFSLibraryDirectoryPath
  PicturesDirectoryPath = FSModule.RNFSPicturesDirectoryPath
  FileProtectionKeys = FSModule.RNFSFileProtectionKeys

  mkdir = async(filepath: string, options: MkdirOptions = {}): Promise<void> => {
    return FSModule.mkdir(normalizeFilePath(filepath), options).then(() => void 0);
  }

  moveFile = async(filepath: string, destPath: string, options: FileOptions = {}): Promise<void> => {
    return FSModule.moveFile(normalizeFilePath(filepath), normalizeFilePath(destPath), options).then(() => void 0);
  }

  copyFile = async(filepath: string, destPath: string, options: FileOptions = {}): Promise<void> => {
    return FSModule.copyFile(normalizeFilePath(filepath), normalizeFilePath(destPath), options).then(() => void 0);
  }

  getAllExternalFilesDirs = async(): Promise<string> => {
    return FSModule.getAllExternalFilesDirs();
  }

  unlink = async(filepath: string): Promise<void> => {
    return FSModule.unlink(normalizeFilePath(filepath)).then(() => void 0);
  }

  exists = async(filepath: string): Promise<boolean> => {
    return FSModule.exists(normalizeFilePath(filepath));
  }

  stopDownload = (jobId: number): void =>  {
    FSModule.stopDownload(jobId);
  }

  resumeDownload = (jobId: number): void =>  {
    FSModule.resumeDownload(jobId);
  }

  isResumable = async(jobId: number): Promise<Boolean> => {
    return FSModule.isResumable(jobId);
  }

  completeHandlerIOS = (jobId: number): void => {
    return FSModule.completeHandlerIOS(jobId);
  }

  readDir = async(dirpath: string): Promise<ReadDirItem[]> =>  {
    return readDirGeneric(dirpath, FSModule.readDir);
  }

  // Android-only

  readDirAssets = async(dirpath: string): Promise<ReadDirItem[]> => {
    if (!FSModule.readDirAssets) {
      throw new Error('readDirAssets is not available on this platform');
    }
    return readDirGeneric(dirpath, FSModule.readDirAssets);
  }

  // Android-only
  existsAssets = (filepath: string) : Boolean => {
    if (!FSModule.existsAssets) {
      throw new Error('existsAssets is not available on this platform');
    }
    return FSModule.existsAssets(filepath);
  }

  // Android-only
  existsRes = (filename: string): Boolean => {
    if (!FSModule.existsRes) {
      throw new Error('existsRes is not available on this platform');
    }
    return FSModule.existsRes(filename);
  }

  // Node style version (lowercase d). Returns just the names
  readdir = async(dirpath: string): Promise<string[]> =>  {
    return FSModule.readDir(normalizeFilePath(dirpath)).then((files:any) => {
      return files.map((file:any) => file.name);
    });
  }

  // setReadable for Android
  setReadable = async(filepath: string, readable: boolean, ownerOnly: boolean): Promise<boolean> => {
    return FSModule.setReadable(filepath, readable, ownerOnly).then((result:any) => {
      return result;
    })
  }

  stat = async(filepath: string): Promise<StatResult> => {
    return FSModule.stat(normalizeFilePath(filepath)).then((result:any) => {
      return {
        'path': filepath,
        'ctime': new Date(result.ctime * 1000),
        'mtime': new Date(result.mtime * 1000),
        'size': result.size,
        'mode': result.mode,
        'originalFilepath': result.originalFilepath,
        isFile: () => result.type === RNFSFileTypeRegular,
        isDirectory: () => result.type === RNFSFileTypeDirectory,
      };
    });
  }

  readFile = async(filepath: string, encodingOrOptions?: any): Promise<string> => {
    return readFileGeneric(filepath, encodingOrOptions, FSModule.readFile);
  }

  read = async(filepath: string, length: number = 0, position: number = 0, encodingOrOptions?: any): Promise<string> => {
    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = encodingOrOptions;
      }
    }

    return FSModule.read(normalizeFilePath(filepath), length, position).then((b64:string) => {
      var contents;

      if (options.encoding === 'utf8') {
        contents = utf8.decode(base64.decode(b64));
      } else if (options.encoding === 'ascii') {
        contents = base64.decode(b64);
      } else if (options.encoding === 'base64') {
        contents = b64;
      } else {
        throw new Error('Invalid encoding type "' + String(options.encoding) + '"');
      }

      return contents;
    });
  }

  // Android only
  readFileAssets = async(filepath: string, encodingOrOptions?: any): Promise<string> => {
    if (!FSModule.readFileAssets) {
      throw new Error('readFileAssets is not available on this platform');
    }
    return readFileGeneric(filepath, encodingOrOptions, FSModule.readFileAssets);
  }

  // Android only
  readFileRes = async(filename: string, encodingOrOptions?: any): Promise<string> => {
    if (!FSModule.readFileRes) {
      throw new Error('readFileRes is not available on this platform');
    }
    return readFileGeneric(filename, encodingOrOptions, FSModule.readFileRes);
  }

  // Android only
  copyFileAssets = (filepath: string, destPath: string) => {
    if (!FSModule.copyFileAssets) {
      throw new Error('copyFileAssets is not available on this platform');
    }
    return FSModule.copyFileAssets(normalizeFilePath(filepath), normalizeFilePath(destPath)).then(() => void 0);
  }

  // Android only
  copyFileRes = (filename: string, destPath: string) =>  {
    if (!FSModule.copyFileRes) {
      throw new Error('copyFileRes is not available on this platform');
    }
    return FSModule.copyFileRes(filename, normalizeFilePath(destPath)).then(() => void 0);
  }

  writeFile = async(filepath: string, contents: string, encodingOrOptions?: any): Promise<void> => {
    var b64;

    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = {
          ...options,
          ...encodingOrOptions
        };
      }
    }

    if (options.encoding === 'utf8') {
      b64 = base64.encode(utf8.encode(contents));
    } else if (options.encoding === 'ascii') {
      b64 = base64.encode(contents);
    } else if (options.encoding === 'base64') {
      b64 = contents;
    } else {
      throw new Error('Invalid encoding type "' + options.encoding + '"');
    }

    return FSModule.writeFile(normalizeFilePath(filepath), b64, options).then(() => void 0);
  }

  appendFile = async(filepath: string, contents: string, encodingOrOptions?: any): Promise<void> => {
    var b64;

    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = encodingOrOptions;
      }
    }

    if (options.encoding === 'utf8') {
      b64 = base64.encode(utf8.encode(contents));
    } else if (options.encoding === 'ascii') {
      b64 = base64.encode(contents);
    } else if (options.encoding === 'base64') {
      b64 = contents;
    } else {
      throw new Error('Invalid encoding type "' + options.encoding + '"');
    }

    return FSModule.appendFile(normalizeFilePath(filepath), b64);
  }

  write = async(filepath: string, contents: string, position?: number, encodingOrOptions?: any): Promise<void> => {
    var b64;

    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = encodingOrOptions;
      }
    }

    if (options.encoding === 'utf8') {
      b64 = base64.encode(utf8.encode(contents));
    } else if (options.encoding === 'ascii') {
      b64 = base64.encode(contents);
    } else if (options.encoding === 'base64') {
      b64 = contents;
    } else {
      throw new Error('Invalid encoding type "' + options.encoding + '"');
    }

    if (position === undefined) {
      position = -1;
    }

    return FSModule.write(normalizeFilePath(filepath), b64, position).then(() => void 0);
  }

  downloadFile = (options: DownloadFileOptions): { jobId: number, promise: Promise<DownloadResult> } => {
    if (typeof options !== 'object') throw new Error('downloadFile: Invalid value for argument `options`');
    if (typeof options.fromUrl !== 'string') throw new Error('downloadFile: Invalid value for property `fromUrl`');
    if (typeof options.toFile !== 'string') throw new Error('downloadFile: Invalid value for property `toFile`');
    if (options.headers && typeof options.headers !== 'object') throw new Error('downloadFile: Invalid value for property `headers`');
    if (options.background && typeof options.background !== 'boolean') throw new Error('downloadFile: Invalid value for property `background`');
    if (options.progressDivider && typeof options.progressDivider !== 'number') throw new Error('downloadFile: Invalid value for property `progressDivider`');
    if (options.progressInterval && typeof options.progressInterval !== 'number') throw new Error('downloadFile: Invalid value for property `progressInterval`');
    if (options.readTimeout && typeof options.readTimeout !== 'number') throw new Error('downloadFile: Invalid value for property `readTimeout`');
    if (options.connectionTimeout && typeof options.connectionTimeout !== 'number') throw new Error('downloadFile: Invalid value for property `connectionTimeout`');
    if (options.backgroundTimeout && typeof options.backgroundTimeout !== 'number') throw new Error('downloadFile: Invalid value for property `backgroundTimeout`');
    var jobId = getJobId();
    var subscriptions: any[] = [];
    if (options.begin) {
      subscriptions.push(RNFS_NativeEventEmitter.addListener('DownloadBegin', (res) => {
        if (res.jobId === jobId) options.begin(res);
      }));
    }
    if (options.progress) {
      subscriptions.push(RNFS_NativeEventEmitter.addListener('DownloadProgress', (res) => {
        if (res.jobId === jobId) options.progress(res);
      }));
    }
    if (options.resumable) {
      subscriptions.push(RNFS_NativeEventEmitter.addListener('DownloadResumable', (res) => {
        if (res.jobId === jobId) options.resumable();
      }));
    }
    var bridgeOptions = {
      jobId: jobId,
      fromUrl: options.fromUrl,
      toFile: normalizeFilePath(options.toFile),
      headers: options.headers || {},
      background: !!options.background,
      progressDivider: options.progressDivider || 0,
      progressInterval: options.progressInterval || 0,
      readTimeout: options.readTimeout || 15000,
      connectionTimeout: options.connectionTimeout || 5000,
      backgroundTimeout: options.backgroundTimeout || 3600000, // 1 hour
      hasBeginCallback: options.begin instanceof Function,
      hasProgressCallback: options.progress instanceof Function,
      hasResumableCallback: options.resumable instanceof Function,
    };
    return {
      jobId,
      promise: FSModule.downloadFile(bridgeOptions).then((res:any) => {
        subscriptions.forEach(sub => sub.remove());
        return res;
      })
        .catch((e:Error) => {
          return Promise.reject(e);
        })
    };
  }

  touch = async(filepath: string, mtime?: Date, ctime?: Date): Promise<void> => {
    if (ctime && !(ctime instanceof Date)) throw new Error('touch: Invalid value for argument `ctime`');
    if (mtime && !(mtime instanceof Date)) throw new Error('touch: Invalid value for argument `mtime`');
    var ctimeTime: number | undefined = 0;
    if (isIOS) {
      ctimeTime = ctime && ctime.getTime();
    }
    return FSModule.touch(
      normalizeFilePath(filepath),
      mtime && mtime.getTime(),
      ctimeTime
    );
  }

  scanFile = (path: string): Promise<ReadDirItem[]> =>  {
    return FSModule.scanFile(path);
  }



}

export default new FSManager()