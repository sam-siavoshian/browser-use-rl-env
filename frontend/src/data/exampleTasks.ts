export type ExampleTask = {
  id: string;
  label: string;
  task: string;
};

export const EXAMPLE_TASKS: ExampleTask[] = [
  {
    id: 'wiki',
    label: 'Wikipedia intro',
    task:
      "Search Wikipedia for 'Photosynthesis', open the article, and tell me the first sentence of the introduction.",
  },
  {
    id: 'gh-trending',
    label: 'GitHub trending',
    task:
      'Go to github.com/trending, pick the first Python repository in the list, and report its name and star count.',
  },
  {
    id: 'weather',
    label: 'Weather snapshot',
    task:
      "Open weather.gov, search for the forecast for Denver, CO, and report today's high temperature.",
  },
  {
    id: 'recipe',
    label: 'Recipe search',
    task:
      'On allrecipes.com, search for banana bread, open the first result, and list the total time and rating.',
  },
  {
    id: 'hn-ask',
    label: 'Ask HN top post',
    task:
      'Go to news.ycombinator.com/ask, open the top post, and summarize the question in one sentence.',
  },
];
