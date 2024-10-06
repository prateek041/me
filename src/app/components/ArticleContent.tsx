const ArticleContent = ({ pageContent }: { pageContent: string }) => {
  return (
    <div className="prose prose-invert pl-10 py-10 text-[#FAF0E6]">
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>;
    </div>
  );
};

export default ArticleContent;
