//
//  ToastModule.m
//  JSMarathon
//
//  Created by admin on 30/09/21.
//

#import "ToastModule.h"
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import "UIView+Toast.h"

@implementation ToastModule

RCT_EXPORT_MODULE(Toast)

RCT_EXPORT_METHOD(show : (NSString *)message position: (NSString *)position duration: (nonnull NSNumber *)duration theme: (NSString *)theme) {
  dispatch_async(dispatch_get_main_queue(), ^{
    
    NSTimeInterval interval = [duration doubleValue];
    
    NSString *toastPos = @"";
    
    if ([position  isEqual: @"TOP"]) {
      toastPos = (id)CSToastPositionTop;
    } else if([position  isEqual: @"CENTER"]) {
      toastPos = (id)CSToastPositionCenter;
    }else{
      toastPos = (id)CSToastPositionBottom;
    }
    
    CSToastStyle *style = [[CSToastStyle alloc] initWithDefaultStyle];
    
    if ([theme  isEqual: @"DARK"]) {
      style.backgroundColor = [UIColor whiteColor];
      style.messageColor = [UIColor blackColor];
    } else{
      style.backgroundColor = [UIColor blackColor];
      style.messageColor = [UIColor whiteColor];
    }
    
    UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
    [rootViewController.view makeToast:message duration: interval position:toastPos style:style];
    
  });
}
  

@end

