const ArticleContent = ({ pageContent }: { pageContent: string }) => {
  return (
    <div className="  bg-background/90 backdrop-blur-lg w-full scroll-smooth md:pl-10 md:py-10 px-2 py-5 mb-10">
      <div className="container prose prose-neutral dark:prose-invert xl:prose-lg mx-auto" dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </div>
  );
};

export default ArticleContent;
