
export default {
  parentNode:
    `{
  path: '##path##',
  component: () => import('##component##'),
  meta: ##meta##,
  children: [##children##],
}
`,
  leafNode:
    `{
      path: '##path##',
      component: () => import('##component##'),
      meta: ##meta##,
      children: [
        {
          path: '/',
          name: '##name##', 
          component: () => import('@/##filePath##'),
        },
      ],
}
`,
  singleParentNode:
    `{
  path: '##path##',
  component: () => import('##component##'),
  meta: ##meta##,
  children: [
    {
      path: '/',
      name: '##name##', 
      component: () => import('@/##filePath##'),
    },
  ],
}
`,
  parentWithEntryNode:
    `{
  path: '##path##',
  component: () => import('##component##'),
  meta: ##meta##,
  children: [
    {
      path: '/',
      name: '##name##', 
      component: () => import('@/##filePath##'),
    },
    ##children##
  ],
}
`,
}
