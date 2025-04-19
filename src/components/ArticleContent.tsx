const ArticleContent = ({ pageContent }: { pageContent: string }) => {
  return (
    <div className="prose prose-neutral dark:prose-invert bg-background w-full xl:prose-lg scroll-smooth md:pl-10 md:py-10 px-2 py-5 mb-10 ">
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </div>
  );
};

export default ArticleContent;
