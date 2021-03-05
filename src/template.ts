
export default {
  parentNode:
    `
{
  path: '##path##',##redirect##
  component: ##layoutComponent##, 
  children: [
    {
      path: '##customPath##',##redirect##
      name: '##name##', 
      fullPath:'##fullPath##',
      component: ##component##,
      meta: ##meta##,
    },
    ##children##
  ],
}
`,
  leafNode:
    `
{
      path: '##path##',
      component: ##layoutComponent##, 
      children: [
        {
          path: '##customPath##',##redirect##
          name: '##name##', 
          fullPath:'##fullPath##',
          component: ##component##,
          meta: ##meta##,
        },
      ],
}
`,
  singleParentNode:
    `
{
  path: '##path##',
  component: ##layoutComponent##, 
  children: [
    {
      path: '##customPath##',##redirect##
      name: '##name##', 
      fullPath:'##fullPath##',
      component: ##component##,
      meta: ##meta##,
    },
  ],
}
`,
  parentWithEntryNode:
    `
{
  path: '##path##',
  component: ##layoutComponent##, 
  children: [
    {
      path: '##customPath##',##redirect##
      name: '##name##', 
      fullPath:'##fullPath##',
      component: ##component##,
      meta: ##meta##,
    },
    ##children##
  ],
}
`}