describe('App', () => {
  
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.reloadReactNative()
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("renders visualizer screen",async()=>{
    await expect(element(by.id("v-screen"))).toBeVisible()
  })

//   it('can navigate between menu and order tabs', async () => {
//     await expect(element(by.id('menu-screen'))).toExist();
//     await element(by.id('orders-tab')).tap();
//     await expect(element(by.id('orders-list'))).toBeVisible();
//     await element(by.id('menu-tab')).tap();
//     await expect(element(by.id('menu-screen'))).toExist();
//   });

//   it('can navigate to orders tab and view previous orders', async () => {
//     await element(by.id('orders-tab')).tap();
//     await expect(
//       element(by.id('order-item').withDescendant(by.text('Status: delivered'))),
//     ).toBeVisible();
//   });

//   it('can select a pizza from the menu, pick a size, and submit an order', async () => {
//     await element(by.text('Order').withAncestor(by.id('supreme'))).tap();
//     await element(by.text('large')).tap();
//     await expect(element(by.id('total'))).toHaveText('$28');
//     await element(by.id('order-button')).tap();
//     await expect(
//       element(by.id('order-item').withDescendant(by.text('Supreme'))),
//     ).toExist();
//   });

//   it('build screen can add and remove toppings', async () => {
//     await element(by.text('Build Your Own')).tap();
//     await element(by.text('PEPPERONI')).tap();
//     await element(by.text('BASIL')).tap();
//     await element(by.text('BACON')).tap();
//     await expect(
//       element(by.text('PEPPERONI').withAncestor(by.id('selected-toppings'))),
//     ).toExist();
//     await expect(
//       element(by.text('BASIL').withAncestor(by.id('selected-toppings'))),
//     ).toExist();
//     await expect(
//       element(by.text('BACON').withAncestor(by.id('selected-toppings'))),
//     ).toExist();
//     await expect(element(by.id('total'))).toHaveText('$20');
//     await element(by.text('BASIL')).tap();
//     await expect(
//       element(by.text('BASIL').withAncestor(by.id('available-toppings'))),
//     ).toExist();
//     await expect(element(by.id('total'))).toHaveText('$18');
//   });

//   it('build screen can select toppings, pick a size, and submit order', async () => {
//     await element(by.text('Build Your Own')).tap();
//     await element(by.text('PEPPERONI')).tap();
//     await element(by.text('BASIL')).tap();
//     await element(by.text('BACON')).tap();
//     await element(by.text('small')).tap();
//     await expect(element(by.id('total'))).toHaveText('$16');
//     await element(by.id('submit-order')).tap();
//     await expect(
//       element(by.id('order-item').withDescendant(by.text('Custom'))),
//     ).toExist();
//   });
});
