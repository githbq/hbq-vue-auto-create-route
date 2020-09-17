/* eslint global-require: 0 */
describe('module-poilerplate: index', () => {
  const mocks = {
    files: {
      yourModule: { run: jest.fn() }
    }
  }

  beforeAll(() => {
    jest.mock('../yourModule', () => function yourModule () {
      return { run: mocks.files.yourModule.run }
    })
  })

  test('运行脚手架，调用run方法', () => {
    require('../index')

    expect(mocks.files.yourModule.run).toHaveBeenCalled()
  })
})
