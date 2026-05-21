declare module "@pagefind/default-ui" {
  declare class PagefindUI {
    constructor(opts: {
      element?: string | HTMLElement,
      bundlePath?: string,
      pageSize?: number,
      resetStyles?: boolean,
      showImages?: boolean,
      showSubResults?: boolean,
      excerptLength?: number,
      processResult?: any,
      processTerm?: any,
      showEmptyFilters?: boolean,
      debounceTimeoutMs?: number,
      mergeIndex?: any,
      translations?: any,
      autofocus?: boolean,
      sort?: any,
      filters?: any,
      filterMode?: any,
    })
  }
}

declare module "remark-collapse" {
  interface RemarkCollapseOptions {
    test: string | RegExp;
    summary?: string | ((str: string) => string);
  }

  function remarkCollapse(opts: RemarkCollapseOptions): void;
  export = remarkCollapse;
}