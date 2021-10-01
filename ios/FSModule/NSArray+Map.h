//
//  NSArray+Map.h
//  JSMarathon
//
//  Created by admin on 30/09/21.
//

#import <Foundation/Foundation.h>

@interface NSArray (Map)

- (NSArray *)rnfs_mapObjectsUsingBlock:(id (^)(id obj, NSUInteger idx))block;

@end
