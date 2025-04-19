const ArticleContent = ({ pageContent }: { pageContent: string }) => {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert bg-background/90 backdrop-blur-lg w-full xl:prose-lg scroll-smooth md:pl-10 md:py-10 px-2 py-5 mb-10">
      <div className="max-w-5xl container mx-auto" dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </div>
  );
};

export default ArticleContent;
