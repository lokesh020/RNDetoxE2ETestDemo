//
//  NSArray+Map.m
//  JSMarathon
//
//  Created by admin on 30/09/21.
//

#import "NSArray+Map.h"

@implementation NSArray (Map)

- (NSArray *)rnfs_mapObjectsUsingBlock:(id (^)(id obj, NSUInteger idx))block
{
  NSMutableArray *result = [NSMutableArray arrayWithCapacity:[self count]];

  [self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
    [result addObject:block(obj, idx)];
  }];

  return result;
}

@end
