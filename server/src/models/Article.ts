// models/Article.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import User from './User';

interface ArticleAttributes {
  id: number;
  userId: number;
  title: string;
  content: string;
}

interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id'> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public content!: string;

  // タイムスタンプ
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    title: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: new DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'articles',
    sequelize,
  }
);

// リレーションを定義
Article.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Article, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'articles',
});

export default Article;
