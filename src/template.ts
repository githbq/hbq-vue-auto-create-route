
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
      meta: ##meta##, 
      children: [
        {
          path: '/',##redirect##
          name: '##name##', 
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
  meta: ##meta##,
  children: [
    {
      path: '/',##redirect##
      name: '##name##', 
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
  meta: ##meta##, 
  children: [
    {
      path: '/',##redirect##
      name: '##name##', 
      component: ##component##,
      meta: ##meta##,
    },
    ##children##
  ],
}
`}