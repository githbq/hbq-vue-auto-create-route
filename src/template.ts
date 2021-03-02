
export default {
  parentNode:
    `
{
  path: '##path##',##redirect##
  component: ##layoutComponent##,
  meta: ##meta##,
  children: [
    {
      path: '/',##redirect##
      name: '##name##', 
      component: ##component##,
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
      meta: ##meta##, 
      children: [
        {
          path: '/',##redirect##
          name: '##name##', 
          component: ##component##,
        },
      ],
}
`,
  singleParentNode:
    `
{
  path: '##path##',
  component: ##layoutComponent##,
  meta: ##meta##,
  children: [
    {
      path: '/',##redirect##
      name: '##name##', 
      component: ##component##,
    },
  ],
}
`,
  parentWithEntryNode:
    `
{
  path: '##path##',
  component: ##layoutComponent##,
  meta: ##meta##, 
  children: [
    {
      path: '/',##redirect##
      name: '##name##', 
      component: ##component##,
    },
    ##children##
  ],
}
`}