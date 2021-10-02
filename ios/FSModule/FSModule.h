//
//  FSModule.h
//  JSMarathon
//
//  Created by admin on 30/09/21.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTLog.h>

typedef void (^CompletionHandler)(void);

@interface FSModule : RCTEventEmitter <RCTBridgeModule>

+(void)setCompletionHandlerForIdentifier: (NSString *)identifier completionHandler: (CompletionHandler)completionHandler;

@end



