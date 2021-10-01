//
//  FSModule.m
//  JSMarathon
//
//  Created by admin on 30/09/21.
//

#import "FSModule.h"

#import "NSArray+Map.h"
#import "FileDownloader.h"

#import <React/RCTUtils.h>

#if __has_include(<React/RCTImageLoader.h>)
#import <React/RCTImageLoader.h>
#else
#import <React/RCTImageLoaderProtocol.h>
#endif

#import <CommonCrypto/CommonDigest.h>

@interface FSModule()

@property (retain) NSMutableDictionary* downloaders;
@property (retain) NSMutableDictionary* uuids;

@end

@implementation FSModule

static NSMutableDictionary *completionHandlers;

RCT_EXPORT_MODULE(FSModule);

- (dispatch_queue_t)methodQueue {
  return dispatch_queue_create("vijay.lok.rnfs", DISPATCH_QUEUE_SERIAL);
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}


RCT_EXPORT_METHOD(readDir:(NSString *)dirPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;

    NSArray *contents = [fileManager contentsOfDirectoryAtPath:dirPath error:&error];

    contents = [contents rnfs_mapObjectsUsingBlock:^id(NSString *obj, NSUInteger idx) {
    
    NSString *path = [dirPath stringByAppendingPathComponent:obj];
    NSDictionary *attributes = [fileManager attributesOfItemAtPath:path error:nil];

    return @{
             @"ctime": [self dateToTimeIntervalNumber:(NSDate *)[attributes objectForKey:NSFileCreationDate]],
             @"mtime": [self dateToTimeIntervalNumber:(NSDate *)[attributes objectForKey:NSFileModificationDate]],
             @"name": obj,
             @"path": path,
             @"size": [attributes objectForKey:NSFileSize],
             @"type": [attributes objectForKey:NSFileType]
             };
  }];

  if (error) {
    return [self reject:reject withError:error];
  }

  resolve(contents);
}

RCT_EXPORT_METHOD(exists:(NSString *)filepath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(__unused RCTPromiseRejectBlock)reject)
{
  
  BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:filepath];
  resolve([NSNumber numberWithBool:fileExists]);
  
}


RCT_EXPORT_METHOD(stat:(NSString *)filepath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSError *error = nil;
  NSDictionary *attributes = [[NSFileManager defaultManager] attributesOfItemAtPath:filepath error:&error];

  if (error) {
    return [self reject:reject withError:error];
  }

  attributes = @{
                 @"ctime": [self dateToTimeIntervalNumber:(NSDate *)[attributes objectForKey:NSFileCreationDate]],
                 @"mtime": [self dateToTimeIntervalNumber:(NSDate *)[attributes objectForKey:NSFileModificationDate]],
                 @"size": [attributes objectForKey:NSFileSize],
                 @"type": [attributes objectForKey:NSFileType],
                 @"mode": @([[NSString stringWithFormat:@"%ld", (long)[(NSNumber *)[attributes objectForKey:NSFilePosixPermissions] integerValue]] integerValue])
                 };

  resolve(attributes);
  
}


RCT_EXPORT_METHOD(writeFile:(NSString *)filepath
                  contents:(NSString *)base64Content
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64Content options:NSDataBase64DecodingIgnoreUnknownCharacters];

  NSMutableDictionary *attributes = [[NSMutableDictionary alloc] init];

  if ([options objectForKey:@"NSFileProtectionKey"]) {
    [attributes setValue:[options objectForKey:@"NSFileProtectionKey"] forKey:@"NSFileProtectionKey"];
  }

  BOOL success = [[NSFileManager defaultManager] createFileAtPath:filepath contents:data attributes:attributes];

  if (!success) {
    return reject(@"ENOENT", [NSString stringWithFormat:@"ENOENT: no such file or directory, open '%@'", filepath], nil);
  }

  return resolve(nil);
  
}


RCT_EXPORT_METHOD(appendFile:(NSString *)filepath
                  contents:(NSString *)base64Content
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64Content options:NSDataBase64DecodingIgnoreUnknownCharacters];

  NSFileManager *fM = [NSFileManager defaultManager];

  if (![fM fileExistsAtPath:filepath])
  {
    BOOL success = [[NSFileManager defaultManager] createFileAtPath:filepath contents:data attributes:nil];

    if (!success) {
      return reject(@"ENOENT", [NSString stringWithFormat:@"ENOENT: no such file or directory, open '%@'", filepath], nil);
    } else {
      return resolve(nil);
    }
    
  }
  
  @try {
      
      NSFileHandle *fH = [NSFileHandle fileHandleForUpdatingAtPath:filepath];

      [fH seekToEndOfFile];
      [fH writeData:data];

      return resolve(nil);
    } @catch (NSException *exception) {
      NSMutableDictionary * info = [NSMutableDictionary dictionary];
      [info setValue:exception.name forKey:@"ExceptionName"];
      [info setValue:exception.reason forKey:@"ExceptionReason"];
      [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
      [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
      [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];
      NSError *err = [NSError errorWithDomain:@"RNFS" code:0 userInfo:info];
      return [self reject:reject withError:err];
    }
  
}
  

RCT_EXPORT_METHOD(unlink:(NSString*)filepath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSFileManager *manager = [NSFileManager defaultManager];
  BOOL exists = [manager fileExistsAtPath:filepath isDirectory:false];

  if (!exists) {
    return reject(@"ENOENT", [NSString stringWithFormat:@"ENOENT: no such file or directory, open '%@'", filepath], nil);
  }

  NSError *error = nil;
  BOOL success = [manager removeItemAtPath:filepath error:&error];

  if (!success) {
    return [self reject:reject withError:error];
  }

  resolve(nil);
  
}


RCT_EXPORT_METHOD(mkdir:(NSString *)filepath
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSFileManager *manager = [NSFileManager defaultManager];

  NSMutableDictionary *attributes = [[NSMutableDictionary alloc] init];

  if ([options objectForKey:@"NSFileProtectionKey"]) {
    [attributes setValue:[options objectForKey:@"NSFileProtectionKey"] forKey:@"NSFileProtectionKey"];
  }

  NSError *error = nil;
  
  BOOL success = [manager createDirectoryAtPath:filepath withIntermediateDirectories:YES attributes:attributes error:&error];

  if (!success) {
    return [self reject:reject withError:error];
  }

  NSURL *url = [NSURL fileURLWithPath:filepath];

  if ([[options allKeys] containsObject:@"NSURLIsExcludedFromBackupKey"]) {
    NSNumber *value = options[@"NSURLIsExcludedFromBackupKey"];
    success = [url setResourceValue: value forKey: NSURLIsExcludedFromBackupKey error: &error];

    if (!success) {
      return [self reject:reject withError:error];
    }
  }

  resolve(nil);
  
}


RCT_EXPORT_METHOD(readFile:(NSString *)filepath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:filepath];

  if (!fileExists) {
    return reject(@"ENOENT", [NSString stringWithFormat:@"ENOENT: no such file or directory, open '%@'", filepath], nil);
  }

  NSError *error = nil;

  NSDictionary *attributes = [[NSFileManager defaultManager] attributesOfItemAtPath:filepath error:&error];

  if (error) {
    return [self reject:reject withError:error];
  }

  if ([attributes objectForKey:NSFileType] == NSFileTypeDirectory) {
    return reject(@"EISDIR", @"EISDIR: illegal operation on a directory, read", nil);
  }

  NSData *content = [[NSFileManager defaultManager] contentsAtPath:filepath];
  NSString *base64Content = [content base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];

  resolve(base64Content);

}


RCT_EXPORT_METHOD(moveFile:(NSString *)filepath
                  destPath:(NSString *)destPath
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSFileManager *manager = [NSFileManager defaultManager];

  NSError *error = nil;
  
  BOOL success = [manager moveItemAtPath:filepath toPath:destPath error:&error];

  if (!success) {
    return [self reject:reject withError:error];
  }

  if ([options objectForKey:@"NSFileProtectionKey"]) {
    NSMutableDictionary *attributes = [[NSMutableDictionary alloc] init];
    [attributes setValue:[options objectForKey:@"NSFileProtectionKey"] forKey:@"NSFileProtectionKey"];
    BOOL updateSuccess = [manager setAttributes:attributes ofItemAtPath:destPath error:&error];

    if (!updateSuccess) {
      return [self reject:reject withError:error];
    }
  }

  resolve(nil);
  
}

RCT_EXPORT_METHOD(copyFile:(NSString *)filepath
                  destPath:(NSString *)destPath
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSFileManager *manager = [NSFileManager defaultManager];

  NSError *error = nil;
  
  BOOL success = [manager copyItemAtPath:filepath toPath:destPath error:&error];

  if (!success) {
    return [self reject:reject withError:error];
  }

  if ([options objectForKey:@"NSFileProtectionKey"]) {
    NSMutableDictionary *attributes = [[NSMutableDictionary alloc] init];
    [attributes setValue:[options objectForKey:@"NSFileProtectionKey"] forKey:@"NSFileProtectionKey"];
    BOOL updateSuccess = [manager setAttributes:attributes ofItemAtPath:destPath error:&error];

    if (!updateSuccess) {
      return [self reject:reject withError:error];
    }
  }

  resolve(nil);
  
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"DownloadBegin",@"DownloadProgress",@"DownloadResumable"];
}


RCT_EXPORT_METHOD(downloadFile:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  RNFSDownloadParams* params = [RNFSDownloadParams alloc];

  NSNumber* jobId = options[@"jobId"];
  params.fromUrl = options[@"fromUrl"];
  params.toFile = options[@"toFile"];
  NSDictionary* headers = options[@"headers"];
  params.headers = headers;
  NSNumber* background = options[@"background"];
  params.background = [background boolValue];
  NSNumber* discretionary = options[@"discretionary"];
  params.discretionary = [discretionary boolValue];
  NSNumber* cacheable = options[@"cacheable"];
  params.cacheable = cacheable ? [cacheable boolValue] : YES;
  NSNumber* progressInterval= options[@"progressInterval"];
  params.progressInterval = progressInterval;
  NSNumber* progressDivider = options[@"progressDivider"];
  params.progressDivider = progressDivider;
  NSNumber* readTimeout = options[@"readTimeout"];
  params.readTimeout = readTimeout;
  NSNumber* backgroundTimeout = options[@"backgroundTimeout"];
  params.backgroundTimeout = backgroundTimeout;
  bool hasBeginCallback = [options[@"hasBeginCallback"] boolValue];
  bool hasProgressCallback = [options[@"hasProgressCallback"] boolValue];
  bool hasResumableCallback = [options[@"hasResumableCallback"] boolValue];

  __block BOOL callbackFired = NO;

  params.completeCallback = ^(NSNumber* statusCode, NSNumber* bytesWritten) {
    if (callbackFired) {
      return;
    }
    callbackFired = YES;

    NSMutableDictionary* result = [[NSMutableDictionary alloc] initWithDictionary: @{@"jobId": jobId}];
    if (statusCode) {
      [result setObject:statusCode forKey: @"statusCode"];
    }
    if (bytesWritten) {
      [result setObject:bytesWritten forKey: @"bytesWritten"];
    }
    return resolve(result);
  };

  params.errorCallback = ^(NSError* error) {
    if (callbackFired) {
      return;
    }
    callbackFired = YES;
    return [self reject:reject withError:error];
  };

  if (hasBeginCallback) {
    params.beginCallback = ^(NSNumber* statusCode, NSNumber* contentLength, NSDictionary* headers) {
        if (self.bridge != nil)
            [self sendEventWithName:@"DownloadBegin" body:@{@"jobId": jobId,
                                                    @"statusCode": statusCode,
                                                    @"contentLength": contentLength,
                                                    @"headers": headers ?: [NSNull null]}];
    };
  }

  if (hasProgressCallback) {
    params.progressCallback = ^(NSNumber* contentLength, NSNumber* bytesWritten) {
        if (self.bridge != nil)
          [self sendEventWithName:@"DownloadProgress"
                                                  body:@{@"jobId": jobId,
                                                          @"contentLength": contentLength,
                                                          @"bytesWritten": bytesWritten}];
    };
  }

  if (hasResumableCallback) {
    params.resumableCallback = ^() {
        if (self.bridge != nil)
            [self sendEventWithName:@"DownloadResumable" body:@{@"jobId": jobId}];
    };
  }

  if (!self.downloaders) self.downloaders = [[NSMutableDictionary alloc] init];

  RNFSDownloader* downloader = [RNFSDownloader alloc];

  NSString *uuid = [downloader downloadFile:params];

  [self.downloaders setValue:downloader forKey:[jobId stringValue]];
    if (uuid) {
        if (!self.uuids) self.uuids = [[NSMutableDictionary alloc] init];
        [self.uuids setValue:uuid forKey:[jobId stringValue]];
    }
}

RCT_EXPORT_METHOD(stopDownload:(nonnull NSNumber *)jobId)
{
  RNFSDownloader* downloader = [self.downloaders objectForKey:[jobId stringValue]];

  if (downloader != nil) {
    [downloader stopDownload];
  }
}

RCT_EXPORT_METHOD(resumeDownload:(nonnull NSNumber *)jobId)
{
    RNFSDownloader* downloader = [self.downloaders objectForKey:[jobId stringValue]];

    if (downloader != nil) {
        [downloader resumeDownload];
    }
}

RCT_EXPORT_METHOD(isResumable:(nonnull NSNumber *)jobId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
)
{
    RNFSDownloader* downloader = [self.downloaders objectForKey:[jobId stringValue]];

    if (downloader != nil) {
        resolve([NSNumber numberWithBool:[downloader isResumable]]);
    } else {
        resolve([NSNumber numberWithBool:NO]);
    }
}


RCT_EXPORT_METHOD(completeHandlerIOS:(nonnull NSNumber *)jobId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.uuids) {
        NSString *uuid = [self.uuids objectForKey:[jobId stringValue]];
        CompletionHandler completionHandler = [completionHandlers objectForKey:uuid];
        if (completionHandler) {
            completionHandler();
            [completionHandlers removeObjectForKey:uuid];
        }
    }
    resolve(nil);
}


RCT_EXPORT_METHOD(pathForBundle:(NSString *)bundleNamed
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSString *path = [[NSBundle mainBundle].bundlePath stringByAppendingFormat:@"/%@.bundle", bundleNamed];
  NSBundle *bundle = [NSBundle bundleWithPath:path];

  if (!bundle) {
    bundle = [NSBundle bundleForClass:NSClassFromString(bundleNamed)];
    path = bundle.bundlePath;
  }

  if (!bundle.isLoaded) {
    [bundle load];
  }

  if (path) {
    resolve(path);
  } else {
    NSError *error = [NSError errorWithDomain:NSPOSIXErrorDomain
                                         code:NSFileNoSuchFileError
                                     userInfo:nil];

    [self reject:reject withError:error];
    
  }
  
}

RCT_EXPORT_METHOD(getFSInfo:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  unsigned long long totalSpace = 0;
  unsigned long long totalFreeSpace = 0;

  __autoreleasing NSError *error = nil;
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSDictionary *dictionary = [[NSFileManager defaultManager] attributesOfFileSystemForPath:[paths lastObject] error:&error];

  if (dictionary) {
    NSNumber *fileSystemSizeInBytes = [dictionary objectForKey: NSFileSystemSize];
    NSNumber *freeFileSystemSizeInBytes = [dictionary objectForKey:NSFileSystemFreeSize];
    totalSpace = [fileSystemSizeInBytes unsignedLongLongValue];
    totalFreeSpace = [freeFileSystemSizeInBytes unsignedLongLongValue];

    resolve(@{
      @"totalSpace": [NSNumber numberWithUnsignedLongLong:totalSpace],
      @"freeSpace": [NSNumber numberWithUnsignedLongLong:totalFreeSpace]
    });
  } else {
    [self reject:reject withError:error];
  }
  
}


- (NSNumber *)dateToTimeIntervalNumber:(NSDate *)date
{
  return @([date timeIntervalSince1970]);
}

- (void)reject:(RCTPromiseRejectBlock)reject withError:(NSError *)error
{
  NSString *codeWithDomain = [NSString stringWithFormat:@"E%@%zd", error.domain.uppercaseString, error.code];
  reject(codeWithDomain, error.localizedDescription, error);
}

- (NSString *)getPathForDirectory:(int)directory
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES);
  return [paths firstObject];
}


- (NSDictionary *)constantsToExport
{
  return @{
           @"RNFSMainBundlePath": [[NSBundle mainBundle] bundlePath],
           @"RNFSCachesDirectoryPath": [self getPathForDirectory:NSCachesDirectory],
           @"RNFSDocumentDirectoryPath": [self getPathForDirectory:NSDocumentDirectory],
           @"RNFSExternalDirectoryPath": [NSNull null],
           @"RNFSExternalStorageDirectoryPath": [NSNull null],
           @"RNFSTemporaryDirectoryPath": NSTemporaryDirectory(),
           @"RNFSLibraryDirectoryPath": [self getPathForDirectory:NSLibraryDirectory],
           @"RNFSFileTypeRegular": NSFileTypeRegular,
           @"RNFSFileTypeDirectory": NSFileTypeDirectory,
           @"RNFSFileProtectionComplete": NSFileProtectionComplete,
           @"RNFSFileProtectionCompleteUnlessOpen": NSFileProtectionCompleteUnlessOpen,
           @"RNFSFileProtectionCompleteUntilFirstUserAuthentication": NSFileProtectionCompleteUntilFirstUserAuthentication,
           @"RNFSFileProtectionNone": NSFileProtectionNone
          };
}


+(void)setCompletionHandlerForIdentifier: (NSString *)identifier completionHandler: (CompletionHandler)completionHandler
{
    if (!completionHandlers) completionHandlers = [[NSMutableDictionary alloc] init];
    [completionHandlers setValue:completionHandler forKey:identifier];
}
