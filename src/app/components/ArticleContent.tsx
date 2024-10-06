const ArticleContent = ({ pageContent }: { pageContent: string }) => {
  return (
    <div className="pl-10 py-10 text-left">
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>;
    </div>
  );
};

export default ArticleContent;
